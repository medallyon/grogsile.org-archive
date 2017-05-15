$(document).ready(function()
{
    $("a").smoothScroll();
    
    $("#navbarHeader").offset({ top: $("#navbar").height() });

    $('[data-toggle="tooltip"]').tooltip();
});