const nomangle = x => x
onload = async () => {
    const constants = await fetch("./config/constants.json").then(resp => resp.json())
    for (key in constants) {
        window[key] = constants[key]
    }
    const imports = await fetch("./config/js.json").then(resp => resp.json())
    const head = document.head || document.getElementsByTagName('head')[0];
    for (let i = 0; i < imports.length; i++) {
        const script  = document.createElement('script')
        script.src = imports[i]
        script.async = false
        head.appendChild(script)
    }
};
