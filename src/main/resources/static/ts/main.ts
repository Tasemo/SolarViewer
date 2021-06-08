window.onload = async () => {
    const canvas = document.querySelector<HTMLCanvasElement>("#glCanvas")!
    const gl = canvas.getContext("webgl")!
    gl.clearColor(1, 0, 0, 1)
    const vertexShader = await loadShader(gl, gl.VERTEX_SHADER, "shader/entityShader.vert")
    const fragmentShader = await loadShader(gl, gl.FRAGMENT_SHADER, "shader/entityShader.frag")
    const shaderProgram = gl.createProgram()!;
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)
    gl.useProgram(shaderProgram)

    requestAnimationFrame(() => {
        render(gl)
    });
}

async function loadShader(gl: WebGLRenderingContext, type: number, url: string): Promise<WebGLShader> {
    const shader = gl.createShader(type)!
    const source = await (await fetch(url)).text();
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return shader;
}

function render(gl: WebGLRenderingContext) {
    gl.clear(gl.COLOR_BUFFER_BIT)
    requestAnimationFrame(() => render(gl))
}
