
    // Data array is build as you move slider.
    var data = [];

    // Filing status enumeration.
    var FilingStatus = Object.freeze({
        SINGLE: 0,
        JOINT:  1,
        HEAD:   2
    });

    // Stop amounts to tax for each percent range.
    // https://www.forbes.com/sites/kellyphillipserb/2017/12/17/what-the-2018-tax-brackets-standard-deduction-amounts-and-more-look-like-under-tax-reform/#2b996c581401
    var taxData = {
        [FilingStatus.SINGLE]: [
            {
                percent: 0.10,
                stop: 9525,
            },
            {
                percent: 0.12,
                stop: 38700,
            },
            {
                percent: 0.22,
                stop: 82500,
            },
            {
                percent: 0.24,
                stop: 157500,
            },
            {
                percent: 0.32,
                stop: 200000,
            },
            {
                percent: 0.35,
                stop: 500000,
            },
            {
                percent: 0.37,
                stop: 9999999,
            }
        ],
        [FilingStatus.JOINT]: [
            {
                percent: 0.10,
                stop: 19050,
            },
            {
                percent: 0.12,
                stop: 77400,
            },
            {
                percent: 0.22,
                stop: 165000,
            },
            {
                percent: 0.24,
                stop: 315000,
            },
            {
                percent: 0.32,
                stop: 400000,
            },
            {
                percent: 0.35,
                stop: 600000,
            },
            {
                percent: 0.37,
                stop: 9999999,
            }
        ],
        [FilingStatus.HEAD]: [
            {
                percent: 0.10,
                stop: 13600,
            },
            {
                percent: 0.12,
                stop: 51800,
            },
            {
                percent: 0.22,
                stop: 82500,
            },
            {
                percent: 0.24,
                stop: 157500,
            },
            {
                percent: 0.32,
                stop: 200000,
            },
            {
                percent: 0.35,
                stop: 500000,
            },
            {
                percent: 0.37,
                stop: 9999999,
            }
        ]
    }

    // Alternate tax data; 2018 if no taxt law was passed
    //https://www.cnbc.com/2017/12/29/heres-where-you-stand-in-the-new-2018-tax-brackets.html#ampshare=https://www.cnbc.com/2017/12/29/heres-where-you-stand-in-the-new-2018-tax-brackets.html
    var altTaxData = {
        [FilingStatus.SINGLE]: [
            {
                percent: 0.10,
                stop: 9525,
            },
            {
                percent: 0.15,
                stop: 38700,
            },
            {
                percent: 0.25,
                stop: 93700,
            },
            {
                percent: 0.28,
                stop: 195450,
            },
            {
                percent: 0.33,
                stop: 195450,
            },
            {
                percent: 0.35,
                stop: 426700,
            },
            {
                percent: 0.396,
                stop: 9999999,
            }
        ],
        [FilingStatus.JOINT]: [
            {
                percent: 0.10,
                stop: 19050,
            },
            {
                percent: 0.15,
                stop: 77400,
            },
            {
                percent: 0.25,
                stop: 156150,
            },
            {
                percent: 0.28,
                stop: 237950,
            },
            {
                percent: 0.33,
                stop: 424950,
            },
            {
                percent: 0.35,
                stop: 480050,
            },
            {
                percent: 0.396,
                stop: 9999999,
            }
        ],
        [FilingStatus.HEAD]: [
            {
                percent: 0.10,
                stop: 13600,
            },
            {
                percent: 0.15,
                stop: 51850,
            },
            {
                percent: 0.25,
                stop: 133850,
            },
            {
                percent: 0.28,
                stop: 216700,
            },
            {
                percent: 0.33,
                stop: 424950,
            },
            {
                percent: 0.35,
                stop: 453350,
            },
            {
                percent: 0.396,
                stop: 9999999,
            }
        ]
    }

    // Load whichever tax data to use into this.
    var currentTaxData;

    // Run update on load.
    $(document).ready(function() {
        currentTaxData = taxData;
        updateTables();
    });

    // Returns string of a number with commans and a dollar sign.
    function dollarize(num) {
        num = Math.round(num * 100) / 100;
        num = num.toFixed(2);
        return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Returns string of a number formated to be a percent.
    function percentagize(num) {
        if(isNaN(num)) { num = 0; }
        num = Math.round(num * 10000) / 100;
        return num.toString() + '%';
    }

    // Returns proper enum for chosen filing status.
    function getFilingStatus() {
        if ($('#joint').hasClass('active')) {
            return FilingStatus.JOINT;
        } else if ($('#head').hasClass('active')) {
            return FilingStatus.HEAD;
        } else {
            return FilingStatus.SINGLE;
        }
    }

    // Swap out tax data based on checkbox.
    function toggleAltData() {
        if ($('#altTax').prop('checked')) {
            currentTaxData = altTaxData;
        } else {
            currentTaxData = taxData;
        }
        clearChart();
        updateTables();
    }

    // Table changes as input changes.
    function updateTables() {

        // Value from slider.
        var income = parseInt($('#input-income input').val(), 10);

        // Number representing filing status.
        var status = parseInt(getFilingStatus());

        // Array of standard deductions for each status.
        var standardDeductions = [12000, 24000, 18000];

        // Current standard deduction.
        var standardDeduction = standardDeductions[status];

        // Current taxable amount in each bracket.
        taxAmountByBracket = [0, 0, 0, 0, 0, 0, 0];
        taxPaidByBracket = [0, 0, 0, 0, 0, 0, 0];

        // Break down income by bracket.
        if (income - standardDeduction > 0) {
            var lastbracket = false;
            var remaining = income - standardDeduction;

            // Number of tax brackets are hard coded :/
            for(var i = 0; i < 7; i++) {

                // When we run out of money stop this loop.
                if (!lastbracket) {

                    // if taxableIncome is greater than this bracket, just add the amount and subtract that from remaining.
                    if (remaining > currentTaxData[status][i].stop) {
                        taxAmountByBracket[i] = currentTaxData[status][i].stop;
                        taxPaidByBracket[i] = taxAmountByBracket[i] * currentTaxData[status][i].percent;
                        remaining -= currentTaxData[status][i].stop;

                    // if taxableIncome is less than this bracket, add the remaining amount to this bracket.
                    } else if (remaining < currentTaxData[status][i].stop) {
                        taxAmountByBracket[i] = remaining;
                        taxPaidByBracket[i] = taxAmountByBracket[i] * currentTaxData[status][i].percent;
                        lastbracket = true;
                    }
                }
            }
        }

        // Calculate effective tax rate.
        var taxable = taxAmountByBracket.reduce(function(a, b) { return a + b}, 0);
        var totalTax = taxPaidByBracket.reduce(function(a, b) { return a + b}, 0);
        var effectiveTaxRate = totalTax / income;

        // Update main table.
        $('.total-income').html(dollarize(income));
        $('#total-deduction').html(dollarize(standardDeduction));
        $('#total-taxable').html(dollarize(taxable));
        $('#total-tax-rate').html(percentagize(effectiveTaxRate));
        $('#total-tax-amount').html(dollarize(totalTax));

        // Update bracket breakdown.
        for(i in taxAmountByBracket) {
            $('#bracket' + i + '-amount').html(dollarize(taxAmountByBracket[i]));
            $('#bracket' + i + '-percent').html(percentagize(currentTaxData[status][i].percent));
            $('#bracket' + i + '-tax').html(dollarize(taxPaidByBracket[i]));
        }

        // Update data array.
        if(isNaN(income)) income = 0;
        if(isNaN(effectiveTaxRate)) effectiveTaxRate = 0;
        data.push({amount: income, percent: effectiveTaxRate * 100});
        updateChart(data);
    }

    // Chart changes as input changes.
    function updateChart(data) {
        var vis = d3.select("#visualisation");
        vis.selectAll("*").remove();
        var width = 800;
        var height = 425;
        var margins = 25;

        var xScale = d3.scale.linear().range([margins, width - margins]).domain([0, 2000000]);
        var yScale = d3.scale.linear().range([height - margins, margins]).domain([0, 40]);
        var xAxis = d3.svg.axis().scale(xScale);
        var yAxis = d3.svg.axis().scale(yScale).orient("left");

        vis.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margins) + ")")
            .call(xAxis);

        vis.append("svg:g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (margins) + ",0)")
            .call(yAxis);

        var lineGen = d3.svg.line().x(function(d) {
            return xScale(d.amount);
        }).y(function(d) {
            return yScale(d.percent);
        });

        vis.append('svg:path')
            .attr('d', lineGen(data))
            .attr('stroke', 'green')
            .attr('stroke-width', 2)
            .attr('fill', 'none');
    }

    // Clear chart.
    function clearChart() {
        data = [];

        var vis = d3.select("#visualisation");
        vis.selectAll("*").remove();
        var width = 650;
        var height = 425;
        var margins = 25;

        var xScale = d3.scale.linear().range([margins, width - margins]).domain([0, 500000]);
        var yScale = d3.scale.linear().range([height - margins, margins]).domain([0, 40]);
        var xAxis = d3.svg.axis().scale(xScale);
        var yAxis = d3.svg.axis().scale(yScale).orient("left");

        vis.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margins) + ")")
            .call(xAxis);

        vis.append("svg:g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (margins) + ",0)")
            .call(yAxis);

        var lineGen = d3.svg.line().x(function(d) {
            return xScale(d.amount);
        }).y(function(d) {
            return yScale(d.percent);
        });
    }

    // Update filing button when clicked.
    function UpdateStatus(event) {
        $('.status').each(function (index, value) {
            $(this).removeClass('active');
        });
        $(event.currentTarget).addClass('active');
        clearChart();
        updateTables();
    }

    // Handlers
    $('#input-income input').on('#input-income input change', updateTables);
    $('.status').on('.status click', UpdateStatus);
    $('#altTax').on('#altTax click', toggleAltData);
