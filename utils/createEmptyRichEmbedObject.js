function createEmptyRichEmbedObject()
{
    return {
        "author": {},
        "color": utils.randColor(),
        "description": "",
        "fields": [],
        "footer": {
            "text": "Brought to you by © Grogsile Inc.",
            "icon_url": "https://i.grogsile.org/favicon.png"
        },
        "image": "",
        "thumbnail": "",
        "timestamp": "",
        "title": "",
        "url": ""
    }
}

module.exports = createEmptyRichEmbedObject;
