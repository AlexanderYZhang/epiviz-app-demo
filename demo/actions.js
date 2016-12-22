var table;
var measurements;
var filters = {};
var graph;
var selections = {};
window.onload = function() {
    $('#testing').range({
        min: 0,
        max: 10,
        start:5
    });
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
        $('#newmodal').show();
        loadMeasurements();
    });
    $(document).on('click', '#item', function() {
        graph = $(this).text().toLowerCase();
        graph = graph.replace(" ", "-");
        load();
        $('#modal').show();
    })
    // $(document).on('click', '.ui.checkbox input', function(e) {
    //     e.stopPropogation();
    //     console.log("clicked");
    //     var split = this.id.split('-');
    //     if (split[0] === "source") {
    //         var ids = $('[id$=' + split[1] + ']');
    //         ids.checkbox('check');
    //     }   

    // });
}
function attachActions() {
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
    })
}
function filter(value, anno, filter) {
    console.log(measurements);
    console.log(annotations);
    console.log(anno);
    console.log(filters);
    var all_empty = true;
    //filtering for this value
    //if (filter) {
    console.log(filters[anno].indexOf(value));
    console.log(value);
    console.log(filters);
    if (filter) {
        filters[anno].push(value);
    } else {
        filters[anno].splice(filters[anno].indexOf(value),1);
    }
    Object.keys(filters).forEach(function(list) {
        if (filters[list].length !== 0) {
            all_empty = false;
        }
    });
    Object.keys(measurements).forEach(function(source) {
        measurements[source].forEach(function(data) {
            var hide = false;
            if (!(all_empty && $('#' + data['id']).css('display') === 'none')) {
                Object.keys(filters).forEach(function(category) {
                    if (filters[category].length !== 0) {
                        if (filters[category].indexOf(data['annotation'][category]) === -1) {
                            hide = true;
                        }
                    }
                });
            }
            if (hide) {
                $('#' + data['id']).hide();
            } else {
                $('#' + data['id']).show();
            }
        });
    });
}  