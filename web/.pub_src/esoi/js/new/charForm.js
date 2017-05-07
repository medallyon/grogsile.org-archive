const cropperOptions = {
    aspectRatio: 5/4,
    viewMode: 1,
    responsive: true,
    autoCropArea: 1
};

$().ready(function()
{
    let initialChampionPoints = $("#championInput").prop("placeholder");
    $("#avatar").cropper(cropperOptions);

    $("#championBox").change(function()
    {
        if ($("#championInput").next().length)
        {
            $("#championInput")
                .prop("readonly", false)
                .attr("min", 3)
                .attr("max", 50)
                .attr("placeholder", "3-50")
                .next().remove();
        }

        else {
            $("#championInput")
                .prop("readonly", true)
                .attr("min", 1)
                .attr("max", 600)
                .attr("placeholder", initialChampionPoints)
                .parent().append("<div class=\"input-group-addon\">CP</div>");
        }
    });

    $("#newAvatar").change(function()
    {
        if (this.files && this.files[0]) {
            let reader = new FileReader();
            reader.readAsDataURL(this.files[0]);

            reader.onload = function()
            {
                $("#avatar")
                    .cropper("destroy")
                    .attr("src", this.result)
                    .cropper(cropperOptions);
            }
        }
    });

    $("#form").submit(function(e)
    {
        e.preventDefault();

        $('button[type="submit"]').replaceWith('<img id="loading" src="https://i.grogsile.me/esoi/img/ui/gameui/screens_app/gamepad/ouroboros_loading-128.png">');

        $("#avatarData").val(JSON.stringify($("#avatar").cropper("getData"), null, 2));

        e.target.submit();
    });

    $('[data-toggle="tooltip"]').tooltip();
});
