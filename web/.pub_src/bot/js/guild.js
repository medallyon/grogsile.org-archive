$(document).ready(function()
{
    $(` [data-toggle="tooltip"] `).tooltip();
    $(" select[multiple] ").multiselect({
        buttonWidth: "100%",
        enableFiltering: true
    });

    if (/.+\/\d+[\/#](?:list-)?(.+)/g.test(document.location))
    {
        let currentTab = /.+\/\d+[\/#](.+)/g.exec(document.location)[1];
        $(` #list-${currentTab}-list `).tab("show");
        $(" #list-tab ").children().not(` #list-${currentTab}-list `).each(function(x) { $(this).removeClass("active") });
    }
});

$(" #list-tab > a ").on("click", function(e)
{
    e.preventDefault();
    document.location = $(this).prop("href");
    if (!$(this).hasClass("disabled")) $(this).siblings().removeClass("active");
});

$(` form > div.abc-checkbox > input `).change(function(e)
{
    let currentSetting = $(this).prop("id").split("-")[0];
    let $formContent = $(` form > #${currentSetting}-content `);

    if ($(this).prop("checked")) $formContent.removeClass("d-none");
    else $formContent.addClass("d-none");
});

$(` input[id$="-roles-enabled"] `).change(function(e)
{
    let idStart = $(this).prop("id").substring(0, $(this).prop("id").indexOf("-roles-enabled"));
    if ($(this).prop("checked"))
    {
        $(` #${idStart}-toggleRoles-checkbox `).removeClass("d-none");
        $(` #${idStart}-roles-section `).removeClass("d-none");
    }

    else
    {
        $(` #${idStart}-toggleRoles-checkbox `).addClass("d-none");
        $(` #${idStart}-roles-section `).addClass("d-none");
    }
});
