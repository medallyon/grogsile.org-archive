function convertAllInputsToBoolean(body)
{
    for (const v in body)
    {
        let val = body[v];
        if (typeof val === "string")
        {
            if (val === "on") body[v] = true;
            else if (val === "off") body[v] = false;
        } else

        if (typeof val === "object" && !Array.isArray(val)) body[v] = convertAllInputsToBoolean(val);
    }

    return body;
}

module.exports = convertAllInputsToBoolean;
