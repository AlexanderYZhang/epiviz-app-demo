var table;
var measurements;
var current_measurements;
var filters = {};
var graph;
var selections = {};
window.onload = function() {
    var graphs = ["Blocks Track", "Line Track", "Stacked Track", "Genes Track", "Scatter Plot", "Heatmap", "Line Plot", "Stacked Plot", "Icicle"];
    var div = document.getElementById("menu");
    graphs.forEach(function(graph) {
        var item = document.createElement('div');
        var text = document.createElement('a');
        text.text = graph; 
        text.id = "item";
        item.className = "item";
        item.appendChild(text);
        div.appendChild(item);
    });
    $('.menu .item').tab();
    $(document).on('click', '#modalbutton', function() {
        $('#newmodal').modal({
            observeChanges: true
        });
        $('#newmodal').modal('show');
        loadMeasurements();
    });
    $(document).on('click', '#epivizbutton', function() {
        $('#newmodal').modal({
            observeChanges: true
        });
        $('#newmodal').modal('show');
        epiviz_measurements();
    });
    $(document).on('click', '#item', function() {
        graph = $(this).text().toLowerCase();
        graph = graph.replace(" ", "-");
        load();
        $('#modal').show();
    })
}
function attachActions() {
    $('#test').range({
        min: 0,
        max: 10,
        start:10,
        onchange: function(value) {
            $('#testdisplay').html("Value= " + value);
        }
    });
    $('#button').click(function(e) {
        console.log(table.rows( { selected: true } ).data());
        var data = table.rows( { selected: true} ).data();
        var env = document.createElement('epiviz-environment');
        if (measurements) {
            var json = '{';
            for (var i = 0; i < data.length; i++) {
                var m = measurements[data[i][4]];   

                json += '"measurement' + i + '":{"id":"' + m["id"] + '"' +  
                        ',"name":"' + m["name"] +  '"' + 
                        ',"type":"' + m["type"] + '"' + 
                        ',"datasourceId":"' + m["datasourceId"] + '"' + 
                        ',"datasourceGroup":"' + m["datasourcegroup"] + '"' +
                        ',"dataprovider":"' + 'umd' + '"' + 
                        ',"formula":' + 'null' +
                        ',"defaultChartType":' + 'null' + 
                        ',"annotation":' + 'null' +
                        ',"minValue":' + m["minValue"] +
                        ',"maxValue":' + m["maxValue"] + '},';
            }
            json.substring(0, json.length-1);
            json += '}';
            env.measurements = json;
            $('#polymercontainer').append(env);
            //var chart = '<epiviz-' + graph + ' dim-s="' + "['" + "measurement0'," + "'measurement1']" + '"' + '></epiviz-' + graph + '>'
            var chart = document.createElement('epiviz-' + graph);
            chart.setAttribute("dim-s", '["measurement0", "measurement1"]');
            var beforeNode = Polymer.dom($('epiviz-environment')).childNodes[0];
            Polymer.dom($('epiviz-environment')).insertBefore(chart, beforeNode);
            // Polymer.dom($('epiviz-environment').root).appendChild(chart);
            // var chart = '<epiviz-' + graph + ' dim-s="[measurement0","measurement1"]"' + '></epiviz-' + graph + '>'
            // $('epiviz-environment').append(chart);
        }
        $('.ui.modal').hide();
    });
    $('.ui.checkbox input[type="checkbox"]').click(function(e) {
        var split = this.id.split('-');
        //this means that you selected the measurement checkbox
        if (split[0] === "source") {            
            var checked = $(this).parent().prop('class').indexOf('checked') !== -1;
            $(this).parent().toggleClass('checked');
            var ids = $('.ui.checkbox[id$=' + split[1] + ']');
            ids.each(function(index) {
                if (checked) {
                    $(ids[index]).checkbox('set unchecked');
                    delete selections[ids[index].id.split('-')[1]];
                } else {
                    $(ids[index]).checkbox('set checked');
                    $(ids[index]).children().removeClass('hidden');
                    selections[ids[index].id.split('-')[1]] = 1;
                }
            });
        } else {
            var checked = $(this).parent().prop('class').indexOf('checked') !== -1;
            var id = $(this).parent().prop('id');
            if (checked) {
                $(this).parent().checkbox('set unchecked');
                delete selections[id.split('-')[1]];
            } else {
                $(this).parent().checkbox('set checked');
                $(this).removeClass('hidden');
                selections[id.split('-')[1]] = 1;
            }
        }
    });
    
}

function filter(value, anno, filter) {
    var list;
    var recalc;
    var new_list = {};
    if (filter) {
        //recalculate from original list if you are modifying an exisitng filter
        recalc = filters[anno].values.length === 0 ? false : true;
        if (filters[anno].type === "range") {
            recalc = true;
            filters[anno].values = value;
        } else {
            filters[anno].values.push(value);
        }
    } else {
        filters[anno].values.splice(filters[anno].values.indexOf(value),1);
        recalc = true;
    }
    //If filters are all empty, show entire dataset
    Object.keys(filters).forEach(function(list) {
        if (filters[list].length !== 0) {
            all_empty = false;
        }
    });
    console.log(current_measurements);
    if (recalc || !current_measurements) {
        list = measurements;
        current_measurements = {};
    } else {
        list = current_measurements;
    }
    Object.keys(list).forEach(function(source) {
        new_list[source] = [];
    });
    Object.keys(list).forEach(function(source) {
        list[source].forEach(function(data) {
            var hide = false;
            if (!(all_empty && $('#' + data['id']).css('display') === 'none')) {
                if (recalc) {
                    Object.keys(filters).forEach(function(category) {
                        var val = filters[category].values;
                        var type = filters[category].type;
                        if (val.length !== 0) {
                            if (type === "range") {
                                if (data['annotation'][category] < val[0] || data['annotation'][category] > val[1]) {
                                    hide = true;
                                }
                            }
                            else if (filters[category].values.indexOf(data['annotation'][category]) === -1) {
                                hide = true;
                            }
                        }
                    });
                } else {
                    if (filters[anno].values.length !== 0) {
                        var val = filters[anno].values;
                        var type = filters[anno].type;
                        if (type === "range") {
                            if (data['annotation'][anno] < val[0] || data['annotation'][anno] > val[1]) {
                                hide = true;
                            }
                        }
                        else if (filters[anno].values.indexOf(data['annotation'][anno]) === -1) {
                            hide = true;
                        }
                    }
                }
            }
            current_measurements = new_list;
            if (hide) {
                $('#' + data['id']).hide();
            } else {
                new_list[source].push(data);
                $('#' + data['id']).show();
            }
        });
    });
}  
function getRandom(max, min) {
    return Math.floor(Math.random() * (max - min)) + min;
}

