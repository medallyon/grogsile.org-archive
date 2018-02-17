const cropperOptions = {
    aspectRatio: 5/4,
    viewMode: 2,
    responsive: true,
    autoCropArea: 1
};

$().ready(function()
{
    let initialChampionPoints;
    $.ajax({
        url: `/api/users/${$("#userId").text()}?key=GM72HW6CGJr5khtS`,
        dataType: "json",
        success: function(data)
        {
            initialChampionPoints = data.level;
        }
    });

    let initialLevel = $("#championInput").val();
    $("#championBox").change(function()
    {
        if ($("#championBox").prop("checked"))
        {
            $("#championInput")
                .prop("readonly", true)
                .attr("min", 1)
                .attr("max", 600)
                .attr("value", initialChampionPoints)
                .parent().append("<div class=\"input-group-append\"><span class=\"input-group-text\">CP</span></div>");
            $("#championBox + label")
                .tooltip("dispose")
                .attr("title", "Champion")
                .tooltip("show");
        }

        else
        {
            $("#championInput")
                .prop("readonly", false)
                .attr("min", 3)
                .attr("max", 50)
                .attr("placeholder", "3-50")
                .next().remove();
            $("#championBox + label")
                .tooltip("dispose")
                .attr("title", "Non-Champion")
                .tooltip("show");

            if (initialLevel.length) $("#championInput").attr("value", initialLevel);
            else $("#championInput").attr("value", "");
        }
    });

    $("#avatar").cropper(cropperOptions);

    if ($("div.hidden-sm-down").css("display").includes("none")) $("input#dragonknight").prop("required", false);
    else if ($("div.hidden-md-up").css("display").includes("none")) $("input#mobile-dragonknight").prop("required", false);
});

$("#newAvatar").change(function()
{
    if (this.files && this.files[0])
    {
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

function createWarningElement(id, message)
{
    if (!$(`#${id}`).length)
    {
        $("section.jumbotron").before(`<div class="warning row justify-content-center">
            <div class="col-lg-9">
              <div id="${id}" class="alert alert-warning alert-dismissible fade show" role="alert" style="margin-top: 2rem;">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <strong>${message}</strong>
              </div>
            </div>
          </div>`);
    }
}

function validateFormElements()
{
    let validated = true;

    // characterName validation
    if ($("#characterName").val().length < 3 || $("#characterName").val().length > 25)
    {
        createWarningElement("longName-warning", "Your Character's Name length is out of bounds");
        validated = false;
    }
    if (/[^a-zA-Z-'öüäßíáúóé ]/g.test($("#characterName").val()))
    {
        createWarningElement("specialName-warning", "Your Character's Name contains special characters");
        validated = false;
    }
    if ("abcdefghijklmopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ-'öüäßíáúóé ".split("").some(x => $("#characterName").val().includes(x.repeat(3))))
    {
        createWarningElement("repeatName-warning", "Your Character's name contains a letter three or more consecutive times");
        validated = false;
    }

    // biography length validation
    if ($("#biography").val().length > 500)
    {
        createWarningElement("biography-warning", "Biography is too long (max. 500 characters)");
        validated = false;
    }

    // alliance selection validation
    if ($('input[name="alliance"]:checked').length === 0)
    {
        createWarningElement("alliance-warning", "You need to select an alliance for your character");
        validated = false;
    }

    // class selection validation
    if ($('input[name="class"]:checked').length === 0)
    {
        createWarningElement("class-warning", "You need to select a class for your character");
        validated = false;
    }

    // race selection validation
    if ($('input[name="race"]:checked').length === 0)
    {
        createWarningElement("race-warning", "You need to select a race for your character");
        validated = false;
    }

    // roles selection validation
    if ($('input[name="roles"]:checked').length === 0)
    {
        createWarningElement("roles-warning", "You need to select at least one role for your character");
        validated = false;
    }

    if (!validated)
    {
        $("#loading").replaceWith('<button type="submit" class="btn btn-default">Submit</button>');
        $("html, body").animate({
            scrollTop: $(".warning").offset().top - $("#navbar").outerHeight()
        }, 1000);
    }
    return validated;
}

$("#form").submit(function(e)
{
    e.preventDefault();

    $('button[type="submit"]').replaceWith('<img id="loading" src="https://i.grogsile.org/esoi/img/ui/gameui/screens_app/gamepad/ouroboros_loading-128.png">');

    $("#avatarData").val(JSON.stringify($("#avatar").cropper("getData"), null, 2));

    if (validateFormElements()) e.target.submit();
});
