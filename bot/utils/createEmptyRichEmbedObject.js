function createEmptyRichEmbedObject()
{
    return {
        "author": {},
        "color": utils.randColor(),
        "description": "",
        "fields": [],
        "footer": {},
        "image": "",
        "thumbnail": "",
        "title": "",
        "url": ""
    }
}

module.exports = createEmptyRichEmbedObject;
