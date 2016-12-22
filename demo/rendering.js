var table;
var measurements;
var filters = {};
var graph;
var selections = {};
function rightAccordion() {
    for (var i = 0; i < 1; i++) {
        Object.keys(measurements).forEach(function(source) {
            console.log('this is source' + source);
            var item = document.createElement('div');
            var title = document.createElement('a');
            var titlecheckbox = document.createElement('div');
            var checkboxlabel = document.createElement('label');
            var checkboxinput = document.createElement('input');
            var icon = document.createElement('i');
            var content = document.createElement('div');
            var form = document.createElement('div'); 
            var fields = document.createElement('div');
            
            item.className = "item";
            item.id = source;
            title.className = "title";
            titlecheckbox.className = "ui checkbox";
            checkboxinput.type = "checkbox";
            checkboxinput.id = "source-" + source;
            checkboxlabel.innerHTML = source;
            icon.className = "dropdown icon";
            content.className = "content";
            form.className = "ui form";
            measurements[source].forEach(function(point) {
                var field = document.createElement('div');
                var checkbox = document.createElement('div');
                var input = document.createElement('input');
                var label = document.createElement('label');   
                fields.className = "grouped fields";
                field.className = "field";
                field.id = point.id;
                field.style = "padding-left: 2.5%";
                checkbox.className = "ui checkbox";
                checkbox.id = "item-" + point.id + "-" + source;
                input.type = "checkbox";
                //input.id = "item-" + point.id + "-" + source;
                input.name = "small";
                label.innerHTML = point.id;     

                fields.appendChild(field);
                field.appendChild(checkbox);
                checkbox.appendChild(input);
                checkbox.appendChild(label);    
            })
            item.appendChild(title);
            item.appendChild(content);
            title.appendChild(titlecheckbox);
            title.appendChild(icon);
            titlecheckbox.appendChild(checkboxinput);
            titlecheckbox.appendChild(checkboxlabel);
            content.appendChild(fields);    
            $('#rightmenu').append(item);
        });
    }
    console.log('rightmenu');
    $('#rightmenu').accordion({
        exclusive : false,
        selector : {
            trigger: '.title .ui.checkbox label'
        },
        verbose : true
    });
}
function overlay() {
    el = document.getElementById("overlay");
    el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
}
//left menu
function loadMeasurements() {
    $.getJSON('./measurements', function(data) {
        var length = data.result.id.length;
        var info = data.result;
        var values;
        var ranges = {};
        var checkboxIndex = 0;
        measurements = {};
        measurements[data.result.datasourceId] = []
        annotations = Object.keys(data.result.annotation[0]);
        console.log(annotations);
        for (var i = 0; i < length; i++) {
            var obj = {
                "id": info.id[i],
                "name": info.name[i],
                "type": info.type,
                "annotation": info.annotation[i],
                "datasourcegroup": info.datasourceGroup,
                "defaultChartType": info.defaultChartType,
                "minValue": info.minValue,
                "maxValue": info.maxValue,
                "metadata": info.metadata,
            }
            measurements[data.result.datasourceId].push(obj);
        }
        console.log(measurements)
        annotations.forEach(function(text) {
            var item = document.createElement('div');
            var title = document.createElement('a');
            var icon = document.createElement('i');
            var content = document.createElement('div');
            var form = document.createElement('div');
            var fields = document.createElement('div');
            
            Object.keys(measurements).forEach(function(data_source) {
                values = $.unique(measurements[data_source].map(function(id) {
                    return id.annotation[text];
                }));
            });
            values.sort(function(a, b) {
                return a - b;
            });
            filters[text] = [];
            if (text === "Age" || text === "index") {
                var field = document.createElement('div');
                var range1 = document.createElement('div');
                var range2 = document.createElement('div');
                var display1 = document.createElement('span');
                var display2 = document.createElement('span');
                var cont1 = document.createElement('p');
                var cont2 = document.createElement('p');

                field.className = "field";
                field.width = "inherit";
                range1.className = "ui range"
                range1.id = text + "-range1";
                display1.id = text + "-display1";
                cont1.innerHTML = "Min: ";
                cont2.innerHTML = "Max: ";
                fields.appendChild(field);
                field.appendChild(range1);
                cont1.appendChild(display1);
                field.appendChild(cont1);
                ranges[range1.id] = values;
                ranges[range2.id] = values;
            } else {
                values.forEach(function(anno) {
                    var field = document.createElement('div');
                    var checkbox = document.createElement('div');
                    var input = document.createElement('input');
                    var label = document.createElement('label');  
                    field.className = "field";
                    checkbox.className = "ui checkbox";
                    checkbox.id = "checkbox" + checkboxIndex;
                    input.type = "checkbox"
                    input.name = anno;
                    input.value = text + "-" + anno;
                    label.innerHTML = anno; 
                    fields.appendChild(field);
                    field.appendChild(checkbox);
                    checkbox.appendChild(input);
                    checkbox.appendChild(label);
                    checkboxIndex++;
                });
            }
            item.className = "item";
            item.id = text;
            title.className = "title";
            title.innerHTML = text;
            icon.className = "dropdown icon";
            content.className = "active content";
            form.className = "ui form";
            fields.className = "grouped fields";

            item.appendChild(title);
            item.appendChild(content);
            title.appendChild(icon);
            content.appendChild(fields);
            $('#leftmenu').append(item);
        });
        for (var i = 0; i < checkboxIndex; i++) {
            $('#checkbox' + i).checkbox({
                onChecked: function() {
                    filter($(this).val().split("-")[1], $(this).val().split("-")[0], true);
                },
                onUnchecked: function() {
                    filter($(this).val().split("-")[1], $(this).val().split("-")[0], false);
                }
            });
        }
        $('#leftmenu').accordion({
            exclusive: false
        });
        Object.keys(ranges).forEach(function(ids) {
            if (ids.charAt(ids.length-1) == '1') {
                $('#' + ids).range({
                    min: ranges[ids][0],
                    max: ranges[ids][ranges[ids].length-1],
                    start: ranges[ids][0],
                    values: [ranges[ids][0], ranges[ids][ranges[ids].length-1]],
                    step: 1,
                    onChange: function(value) {

                        $('#'+ ids.split('-')[0] + "-display" + ids.charAt(ids.length-1)).html(value);
                    }
                });
            }
        });
        $('.active.content').each(function(index) {
            $('.active.content')[0].className = 'content';
        })
        //Right menu
        rightAccordion();
        attachActions();
    });
}
function load() {
    $.getJSON("http://epiviz.cbcb.umd.edu/data/main.php?action=getMeasurements", function(data) {
        var length = data.data.id.length;
        var info = data.data;
        measurements = [];
        for (var i = 0; i < length; i++) {
            var obj = {
                "id": info.id[i],
                "name": info.name[i],
                "type": info.type[i],
                "annotation": info.annotation[i],
                "datasourcegroup": info.datasourceGroup[i],
                "datasourceId": info.datasourceId[i],
                "defaultChartType": info.defaultChartType[i],
                "minValue": info.minValue[i],
                "maxValue": info.maxValue[i],
                "metadata": info.metadata[i],
            }
            measurements.push(obj);
        }

        var mlength = measurements.length;

        $('#tablediv').append('<table id="modalTable" class="display"><thead><tr><th>Id</th><th>name</th><th>type</th><th>datasourcegroup</th><th>Index</th></tr></thead></table>');

        tableString= '<tbody>';

        for (var i=0; i< mlength; i++) {
            tableString += '<tr><td>' 
            + measurements[i].id + '</td><td>' + measurements[i].name + '</td><td>' + measurements[i].type + '</td><td>' + measurements[i].datasourcegroup+ '</td><td>' + i + '</td></tr>';
        }

        tableString += '</tbody>';
        $('#modalTable').append(tableString);
        table = $('#modalTable').DataTable({
              aoColumns : [
                { sWidth: '25%' },
                { sWidth: '25%' },
                { sWidth: '20%' },
                { sWidth: '25%' },
                { sWidth: '5%' },
              ],
            select: {style: 'os'},
            buttons: [
                {
                    text: 'Finish',
                    action: function ( e, dt, node, config ) {
                        console.log('clicked');
                    }
                }
            ]
        });
        console.log(table.rows('.selected').data());
        console.log(table.rows( { selected: true } ).data());
    });
}