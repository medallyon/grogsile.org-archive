let initialLevel;
$(document).ready(function()
{
    initialLevel = $("#championInput").val();
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
