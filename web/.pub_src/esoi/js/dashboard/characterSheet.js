$().ready(function()
{
    $(".card > .card-block > .card-text").click(function(e)
    {
        e.preventDefault();
        $(this).toggleClass("wrap");
    });
});
