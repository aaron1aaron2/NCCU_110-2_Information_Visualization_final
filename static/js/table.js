
var tabulate = function (data, columns) {
    var table = d3.select('#table1').append('table').attr("class", "table table-responsive table-striped table-bordered table-sm").attr("id", "dtBasicExample")
    var thead = table.append('thead')
    var tbody = table.append('tbody')

    thead.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(function (d) { return d })

    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr')

    var cells = rows.selectAll('td')
        .data(function (row) {
            return columns.map(function (column) {
                return { column: column, value: row[column] }
            })
        })
        .enter()
        .append('td')
        .text(function (d) { return d.value })

    return table;
}

d3.csv('dataset/spot_info.csv', function (data) {
    var columns = ['sno', 'sna', 'tot', 'sarea', 'lat', 'lng', 'ar', 'sareaen', 'snaen', 'aren']
    tabulate(data, columns);

    $(document).ready(function () {
        $('#dtBasicExample').DataTable({
            paging: true,
            "pageLength": 2,
            "lengthMenu": [ 1, 2],
            ordering: true,
            info: true,
        });
    });
})

