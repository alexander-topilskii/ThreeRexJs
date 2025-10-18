precision highp float;
uniform vec2 u_res;
uniform float u_time;

void main() {
  vec2 uv = (gl_FragCoord.xy / u_res) * 2.0 - 1.0;
  float r = length(uv);
  float hue = 0.5 + 0.5 * sin(3.14159 * (r * 3.0 - u_time * 0.8));
  vec3 col = 0.5 + 0.5 * cos(6.2831 * (hue + vec3(0.0, 0.33, 0.66)));
  gl_FragColor = vec4(col, 1.0);
}
