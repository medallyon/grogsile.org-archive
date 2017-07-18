function createEmptyRichEmbedObject()
{
    return {
        "author": {},
        "color": utils.randColor(),
        "description": "",
        "fields": [],
        "footer": {
            "text": "Brought to you by © Grogsile Inc.",
            "iconURL": "https://i.grogsile.me/favicon.png"
        },
        "image": "",
        "thumbnail": "",
        "timestamp": new Date().toISOString(),
        "title": "",
        "url": ""
    }
}

module.exports = createEmptyRichEmbedObject;
