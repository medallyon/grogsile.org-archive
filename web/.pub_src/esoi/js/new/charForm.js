const cropperOptions = {
    aspectRatio: 1,
    viewMode: 1,
    responsive: true,
    autoCropArea: 1,
    cropend: function() {
        croppedImageData = $("#avatar").cropper("getCroppedCanvas").toDataURL();
    }
};

$().ready(function()
{
    let initialChampionPoints = $("#championInput").prop("placeholder");
    let croppedImageData = "";
    $("#avatar").cropper(cropperOptions);

    $("#championBox").change(function()
    {
        if ($("#championInput").next().length)
        {
            $("#championInput")
                .prop("disabled", false)
                .attr("min", 3)
                .attr("max", 50)
                .attr("placeholder", "3-50")
                .next().remove();
        }

        else {
            $("#championInput")
                .prop("disabled", true)
                .attr("min", 1)
                .attr("max", 600)
                .attr("placeholder", 600)
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

    $("#submit").click(function(e)
    {
        e.preventDefault();

        let formData = new FormData();

        formData.append("croppedImage", blob);

        $.ajax("/new", {
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function() {
              console.log("Upload success");
            },
            error: function() {
              console.log("Upload error");
            }
        });
    });

    $('[data-toggle="tooltip"]').tooltip();
});
