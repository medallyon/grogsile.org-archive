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

        $("#avatar").cropper("getCroppedCanvas").toBlob(function(blob)
        {
            let formData = new FormData();

            formData.set("avatar", blob);
            formData.set("characterName", $("#characterName").val());
            formData.set("champion", $("#championBox").prop("checked"));
            formData.set("level", $("#championInput").val());
            formData.set("biography", $("#biography").val());
            formData.set("alliance", $('input[name="alliance"]:checked').prop("value"));
            formData.set("race", $('input[name="race"]:checked').prop("value"));
            formData.set("class", $('input[name="class"]:checked').prop("value"));

            let roles = [];
            $('input[name="roles"]:checked').each(function()
            {
                roles.push($(this).prop("value"));
            });
            formData.set("roles", roles);

            let professions = [];
            $('input[name="professions"]:checked').each(function()
            {
                professions.push($(this).prop("value"));
            });
            formData.set("professions", professions);

            $('button[type="submit"]').replaceWith('<img id="loading" src="https://i.grogsile.me/esoi/img/ui/gameui/screens_app/gamepad/ouroboros_loading-128.png">');

            $.ajax("/new", {
                method: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function(data, status, xhr) {
                  console.log(data);
                  console.log(status);
                  console.log(xhr);
                  window.location.replace("/dashboard");
                },
                error: function(xhr, status, err) {
                  console.log(xhr);
                  console.log(status);
                  console.log(err);
                  window.alert(err);
                  $("#loading").replaceWith('<button type="submit" class="btn btn-default">Submit</button>');
                }
            });
        });
    });

    $('[data-toggle="tooltip"]').tooltip();
});
