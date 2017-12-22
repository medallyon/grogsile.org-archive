let initialLevel;
$(document).ready(function()
{
    initialLevel = $("#championInput").val();

    if ($("div.alert-success").length)
    {
        setTimeout(function()
        {
            window.location.replace("/dashboard");
        }, 5000);
    }
});

$("#championBox").change(function(e)
{
    if ($(this).prop("checked"))
    {
        $("#championBox").parent().append(`<input type="number" id="championInput" name="level" class="form-control text-center" value="${initialLevel}" min="1" max="600" placeholder="${initialLevel}" required>`);
    }

    else {
        $("#championInput").remove();
    }
});

$(".roster[name=\"alliance\"]").change(function(e)
{
    $(this).siblings().each(function(i, ele)
    {
        $(ele).prop("checked", false);
    });
});
