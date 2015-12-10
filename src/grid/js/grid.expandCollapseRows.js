﻿/** 
  * @widget Grid 
  * @plugin Expand Collapse Rows
  */
if (typeof (gj.grid.plugins) === 'undefined') {
    gj.grid.plugins = {};
}

gj.grid.plugins.expandCollapseRows = {
    'configuration': {
        /** Template for the content in the detail section of the row.
          * Automatically add expand collapse column as a first column in the grid during initialization.
          * @type string
          * @default undefined
          * @example <table id="grid"></table>
          * <script>
          *     $('#grid').grid({
          *         dataSource: '/DataSources/GetPlayers',
          *         detailTemplate: '<div><b>DateOfBirth:</b> {DateOfBirth}</div>',
          *         columns: [ { field: 'ID' }, { field: 'Name' }, { field: 'PlaceOfBirth' } ]
          *     });
          * </script>
          */
        detailTemplate: undefined
    },

    'private': {
        detailExpand: function ($cell, $grid) {
            var $contentRow = $cell.closest('tr'),
                $detailsRow = $('<tr data-role="details"></tr>'),
                $detailsCell = $('<td colspan="' + gj.grid.private.countVisibleColumns($grid) + '"></td>'),
                data = $grid.data('grid'),
                rowData = $contentRow.data('row'),
                $detailWrapper = $(rowData.details);
            $detailsRow.append($detailsCell.append($detailWrapper));
            $detailsRow.insertAfter($contentRow);
            $cell.find('span').attr('class', data.style.collapseIcon); //TODO: move to the plugin
            $cell.off('click').on('click', function () {
                gj.grid.plugins.expandCollapseRows.private.detailCollapse($(this), $grid);
            });
            gj.grid.plugins.expandCollapseRows.events.detailExpand($grid, $detailWrapper, rowData.record);
        },

        detailCollapse: function ($cell, $grid) {
            var $contentRow = $cell.closest('tr'),
                $detailsRow = $contentRow.next('tr[data-role="details"]'),
                $detailWrapper = $detailsRow.find('td>div');
            $detailsRow.remove();
            $cell.find('span').attr('class', $grid.data('grid').style.expandIcon); //TODO: move to the plugin
            $cell.off('click').on('click', function () {
                gj.grid.plugins.expandCollapseRows.private.detailExpand($(this), $grid);
            });
            gj.grid.plugins.expandCollapseRows.events.detailCollapse($grid, $detailWrapper, $contentRow.data('row').record);
        },

        updateDetailsColSpan: function ($grid) {
            var $cells = $grid.find('tbody > tr[data-role="details"] > td');
            if ($cells && $cells.length) {
                $cells.attr('colspan', gj.grid.private.countVisibleColumns($grid));
            }
        }
    },

    'public': {
        collapseAll: function () {
            var $grid = this;
            $grid.find('tbody tr[data-role="row"]').each(function () {
                gj.grid.plugins.expandCollapseRows.private.detailCollapse($(this).first(), $grid);
            });
        },

        expandAll: function () {

        }
    },

    'events': {
        detailExpand: function ($grid, $detailWrapper, record) {
            /**
             * Event fires when detail row is showing
             *
             * @event detailExpand
             * @param {object} e - event data
             * @param {object} detailWrapper - the detail wrapper as jQuery object 
             * @param {object} record - the data of the row record 
             * @example <table id="grid"></table>
             * <script>
             *     var grid = $('#grid').grid({
             *         dataSource: '/DataSources/GetPlayers',
             *         detailTemplate: '<div/>',
             *         columns: [ 
             *             { field: 'ID' }, 
             *             { field: 'Name' },
             *             { field: 'PlaceOfBirth' }
             *         ]
             *     });
             *     grid.on('detailExpand', function (e, $detailWrapper, record) {
             *         $detailWrapper.empty().append('Place of Birth: ' + record.PlaceOfBirth);
             *     });
             * </script>
             */
            $grid.trigger('detailExpand', [$detailWrapper, record]);
        },
        detailCollapse: function ($grid, $detailWrapper, record) {
            /**
             * Event fires when detail row is hiding
             *
             * @event detailCollapse
             * @param {object} e - event data
             * @param {object} detailWrapper - the detail wrapper as jQuery object 
             * @param {object} record - the data of the row record 
             * @example <table id="grid"></table>
             * <script>
             *     var grid = $('#grid').grid({
             *         dataSource: '/DataSources/GetPlayers',
             *         detailTemplate: '<div/>',
             *         columns: [ 
             *             { field: 'ID' }, 
             *             { field: 'Name' },
             *             { field: 'PlaceOfBirth' }
             *         ]
             *     });
             *     grid.on('detailExpand', function (e, $detailWrapper, record) {
             *         $detailWrapper.append('Place of Birth: ' + record.PlaceOfBirth);
             *     });
             *     grid.on('detailCollapse', function (e, $detailWrapper, record) {
             *         $detailWrapper.empty();
             *         alert('detailCollapse is fired.');
             *     });
             * </script>
             */
            $grid.trigger('detailCollapse', [$detailWrapper, record]);
        }
    },

    'init': function ($grid) {
        $.extend(true, $grid, gj.grid.plugins.expandCollapseRows.public);
        var data = $grid.data('grid');
        if (typeof (data.detailTemplate) !== 'undefined') {
            data.columns = [{
                title: '',
                field: data.dataKey,
                width: (data.uiLibrary === 'jqueryui' ? 24 : 30),
                align: 'center',
                type: 'icon',
                icon: data.style.expandIcon,
                events: {
                    'click': function () {
                        gj.grid.plugins.expandCollapseRows.private.detailExpand($(this), $grid);
                    }
                }
            }].concat(data.columns);

            $grid.on('rowDataBound', function (e, $row, id, record) {
                $row.data('row').details = $(data.detailTemplate);
            });
            $grid.on('columnShow', function (e, column) {
                gj.grid.plugins.expandCollapseRows.private.updateDetailsColSpan($grid);
            });
            $grid.on('columnHide', function (e, column) {
                gj.grid.plugins.expandCollapseRows.private.updateDetailsColSpan($grid);
            });
            $grid.on('rowRemoving', function (e, $row, id, record) {
                gj.grid.plugins.expandCollapseRows.private.detailCollapse($row.children('td').first(), $grid);
            });
            $grid.on('pageChanging', function () {
                $grid.collapseAll();
            });
        }
    }
};

$.extend(true, gj.grid.config, gj.grid.plugins.expandCollapseRows.configuration);