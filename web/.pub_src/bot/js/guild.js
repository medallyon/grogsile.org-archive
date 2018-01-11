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

$(" #liveServerStatus-update-roles-enabled ").change(function(e)
{
    if ($(this).prop("checked"))
    {
        $(" #liveServerStatus-update-toggleRoles-checkbox ").removeClass("d-none");
        $(" #liveServerStatus-new-role-image ").removeClass("d-none");
        $(" #liveServerStatus-update-roles-section ").removeClass("d-none");
    }

    else
    {
        $(" #liveServerStatus-update-toggleRoles-checkbox ").addClass("d-none");
        $(" #liveServerStatus-new-role-image ").addClass("d-none");
        $(" #liveServerStatus-update-roles-section ").addClass("d-none");
    }
});
