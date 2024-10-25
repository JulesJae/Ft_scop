const vs = /*glsl*/`
  attribute vec4 a_position;
  attribute vec2 a_textcoord;
  attribute vec3 a_color;

  uniform mat4 u_projection;
  uniform mat4 u_world2Camera;
  uniform mat4 u_object2world;

  varying vec2 v_textcoord;
  varying vec3 v_color;

  void main() {
    gl_Position = u_projection * u_world2Camera * u_object2world * a_position;
    v_textcoord = a_textcoord;
    v_color = a_color;
  }
`;

const fs = /*glsl*/`
  precision mediump float;

  varying vec2 v_textcoord;
  varying vec3 v_color;

  uniform int u_useTexture;

  uniform sampler2D u_texture;

  void main() {
    vec4 finalColor;

    if(u_useTexture == 1) {
      finalColor = texture2D(u_texture, v_textcoord);
    } else {
      finalColor = vec4(v_color, 1.0);
    }

    gl_FragColor = finalColor;
  }
`;

export default {
  vs,
  fs
};