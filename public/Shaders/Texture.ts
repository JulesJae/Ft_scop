const vs = /*glsl*/`
  attribute vec4 a_position;
  attribute vec2 a_textcoord;

  uniform mat4 u_projection;
  uniform mat4 u_world2Camera;
  uniform mat4 u_object2world;

  varying vec2 v_textcoord;

  void main() {
    gl_Position = u_projection * u_world2Camera * u_object2world * a_position;
    v_textcoord = a_textcoord;
  }
`;

const fs = /*glsl*/`
  precision mediump float;

  varying vec2 v_textcoord;

  uniform sampler2D u_texture;

  void main() {
    // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    gl_FragColor = texture2D(u_texture, v_textcoord);
  }
`

export default {
  vs,
  fs
};