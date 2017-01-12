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
            observeChanges: true,
            onHidden: function() {
                $('#leftmenu').empty();
                $('#rightmenu').empty();
            }
        });
        $('#newmodal').modal('show');
        loadMeasurements();
    });
    $(document).on('click', '#epivizbutton', function() {
        $('#newmodal').modal({
            observeChanges: true,
            onHidden: function() {
                $('#leftmenu').empty();
                $('#rightmenu').empty();
            }
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
            var ids = $('.ui.checkbox[id$=' + split[1] + ']');
            var $count = $('#count-' + split[1]);
            var selected = parseInt($count.attr("data-selected"));
            var total = parseInt($count.attr("data-total"));

            $(this).parent().toggleClass('checked');
            $('#rightmenu').accordion('refresh');
            _.each(ids, function(value) {
                if (checked) {
                    $(value).checkbox('set unchecked');
                    delete selections[value.id.split('-')[1]];
                } else {
                    $(value).checkbox('set checked');
                    $(value).children().removeClass('hidden');
                    selections[value.id.split('-')[1]] = 1;
                }
            });
            if (checked) {
                $count.attr("data-selected", 0)
                $count.html(" (" + $count.attr("data-selected") + " of " + $count.attr('data-total') + ")");
            } else {
                $count.attr("data-selected", total);
                $count.html(" (" + $count.attr("data-selected") + " of " + $count.attr('data-total') + ")");
            }
        } else {
            var checked = $(this).parent().prop('class').indexOf('checked') !== -1;
            var split = $(this).parent().prop('id').split('-');
            var $count = $('#count-' + split[3]);
            var selected = parseInt($count.attr("data-selected"));
            var total = parseInt($count.attr('data-total'));
            if (checked) {
                $(this).parent().checkbox('set unchecked');
                delete selections[split[1]];
            } else {
                $(this).parent().checkbox('set checked');
                $(this).removeClass('hidden');
                selections[split[1]] = 1;
            }
            if (checked) {
                selected = selected - 1;
                $count.attr("data-selected", selected)
                $count.html(" (" + $count.attr("data-selected") + " of " + $count.attr('data-total') + ")");
            } else {
                selected = selected + 1;
                $count.attr("data-selected", selected);
                $count.html(" (" + $count.attr("data-selected") + " of " + $count.attr('data-total') + ")");
            }

            if (selected > 0 && selected !== total) {
                $('#source-' + split[3]).parent().checkbox('set indeterminate');
                $('#source-' + split[3]).removeClass('hidden');

            } else if (selected === total){
                $('#source-' + split[3]).parent().checkbox('set checked');
                $('#source-' + split[3]).removeClass('hidden');
            } else if (selected === 0) {
                $('#source-' + split[3]).parent().checkbox('set unchecked');
                $('#source-' + split[3]).removeClass('hidden');
            }
        }
    });
    
    $('#rightmenu .field .checkbox label').mouseenter(function() {
        var parent = $(this).parent();
        var split = parent.attr('id').split('-');
        var popup_id = "popup-" + split[1] + "-" + split[3];
        if ($("#" + popup_id).length === 0) {
            var point = measurements[split[3]][split[2]];
            var headers = ['id', 'name', 'datasourcegroup'];
            var contents = [point.id, point.name, point.datasourcegroup];
            if (point.annotation != null) {
                Object.keys(point.annotation).forEach(function(val) {
                    headers.push(val);
                    contents.push(point.annotation[val]);
                });
            }

            //creating popup as seperate div to give it columns
            var popup = document.createElement('div');
            var table = document.createElement('table');
            var t_body = document.createElement('tbody');
            popup.className = 'ui popup';
            popup.id = "popup-" + point.id + "-" + split[3];
            table.className = 'ui compact table';
            table.appendChild(t_body);
            //add columns to the grid
            for (var j = 0; j < contents.length; j++) {
                var row = document.createElement('tr');
                var col1 = document.createElement('td');
                var col2 = document.createElement('td');
                row.appendChild(col1);
                row.appendChild(col2);
                col1.innerHTML = headers[j];
                col2.innerHTML = contents[j];
                t_body.appendChild(row);
            }
            popup.appendChild(table);
            $(this).append(popup);
            $(this).popup({
                popup: '#' + popup.id,
                position: 'right center',
                hoverable: true,
                delay: {
                    show:50,
                    hide: 200,
                }
            });      
            $(this).popup('show');     
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
    _.forEach(filters, function(list, key) {
        if (key.length !== 0) {
            all_empty = false;
        }
    });
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
                            if (data['annotation'] == null || !(category in data['annotation'])) {
                                hide = true;
                            }
                            else if (type === "range") {
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
                        if (data['annotation'] == null || !(anno in data['annotation'])) {
                            hide = true;
                        }
                        else if (type === "range") {
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

function sortAlphaNum(a,b) {
    var reA = /[^a-zA-Z]/g;
    var reN = /[^0-9]/g;
    var aA = a.replace(reA, "");
    var bA = b.replace(reA, "");
    if(aA === bA) {
        var aN = parseInt(a.replace(reN, ""), 10);
        var bN = parseInt(b.replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
}
