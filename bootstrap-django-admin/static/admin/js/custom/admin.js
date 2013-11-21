$(function () {
    if ($('.vDateField, .vTimeField').length > 0) {
        $('.vDateField, .vTimeField').on('focus mouseup', function (e) {
            if (e.type == 'focusin') this.select();
            if (e.type == 'mouseup') return false;
        }).css({
            'text-align': 'center'
        });

        $('.vDateField')
            .css({ 'width': '102px', 'border-radius': '3px 0 0 3px' })
            .datepicker({ 'showToday': true, 'format': 'dd/mm/yyyy' })
            .setMask('date')
            .on('changeDate', function (ev) { $(this).datepicker('hide').blur(); });

        $('.vTimeField')
            .css({ 'width': '64px' })
            .setMask('time');

        $('.datetime').each(function() {
            var inputs = $(this).find('input').removeClass('vDateField vTimeField');

            var container = $('<div class="input-prepend input-append" />');
            container
                .append(inputs.eq(0))
                .append('<span class="add-on"><i class="icon-calendar"></i></span>')
                .append(inputs.eq(1))
                .append('<span class="add-on"><i class="icon-time"></i></span>');

            $(this).replaceWith(container);
        });

        if ($('.vDateField').length > 0)
            $('.vDateField')
                .wrap('<div class="input-append" />')
                .parent()
                .append('<span class="add-on"><i class="icon-calendar"></i></span>');

        if ($('.vTimeField').length > 0)
            $('.vTimeField')
                .wrap('<div class="input-append" />')
                .parent()
                .append('<span class="add-on"><i class="icon-time"></i></span>');
    }

    if ($('[name="cep"]').length > 0)
        $('[name="cep"]').setMask('cep');
    if ($('input[type="text"][name*="fone_set"]').length > 0)
        $('input[type="text"][name*="fone_set"]').setMask('phone');

    $('.add-another').each(function () {
        $(this)
        	.addClass('btn add-on')
        	.html('<i class="icon-plus-sign"></i>')
            .parent()
            .children()
            .wrapAll('<div class="input-append" />');
    });

    $('table td .input-append select').each(function () {
        $(this).width(160).parent().width(192);
    });

    var $select_multiple = $('select[multiple="multiple"]');
    if ($select_multiple.length > 0) {
        $select_multiple.multiselect().parent().removeClass('input-append');
        $('.multiselect').addClass('well');
    }

    // TODO: Validar CPF, CNPJ, Cep e Telefone
});

function setCalendar(calendar) { }
