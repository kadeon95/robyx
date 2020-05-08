"use strict";

var HW1 = function() {
var canvas;
var gl;

var numTimesToSubdivide = 3;

var index = 0;
var numPositions = 84;


//                                                                              ARRAY OF VERTICES AND ATTRIBUTES.
var positionsArray = [];
var normalsArray = [];
var texCoordsArray = [];


var near = 0.01;
var far = 30.0;
var radius = 7.0;
var theta = parseFloat(90)* Math.PI/180.0;
var phi = 0.0* Math.PI/180.0;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 20.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect=1.0;       // Viewport aspect ratio

var left = -3.0;
var right = 3.0;
var top =3.0;
var bottom = -3.0;

var globalAmbient = vec4(0.3,0.3,0.3,1);

var lightDirection = vec4(1, 1, 1, 0.0);
var lightAmbient = vec4(0.3, 0.3, 0.3, 1.0);
var lightDiffuse = vec4(0.1, 0.1, 0.6, 1.0);
var lightSpecular = vec4(0.1, 0.1, 0.6, 1.0);


var spotlightPosition = vec4(0, 0, 1.0, 1.0);
var spotlightAmbient = vec4(0.3, 0.3, 0.3, 1.0);
var spotlightDiffuse = vec4(0.7, 0.3, 0, 1.0);
var spotlightSpecular = vec4(0.7, 0.3, 0, 1.0);


var materialAmbient = vec4(0.1, 0.5, 0.1, 1.0);
var materialDiffuse = vec4(0.1, 0.6, 0.1, 1.0);
var materialSpecular = vec4(0.1, 0.5, 0.1, 1.0);
var materialShininess = 10.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var nMatrix, nMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var base_foliage = 0.6;
var cap = 0.90;
var middle_foliage_height = 0.30;
var upper_foliage_height = 0.60;

var tronco = 0.1;
var middle_foliage = 0.4;
var middle_foliage_cap_offset=0.10;
var upper_foliage_cap_offset=0.10;
var upper_foliage = 0.2;
var base_foliage_up = 0.2;
var middle_foliage_up = 0.1;

var ba=8;
var bb=9;
var bc=10;
var bd=11;

var ma=12;
var mb=13;
var mc=14;
var md=15;



var ua=16;
var ub=17;
var uc=18;
var ud=19;
var ucap=20;

var tronco_b_a = 0;
var tronco_b_b = 1;
var tronco_b_c = 2;
var tronco_b_d = 3;
var tronco_u_a = 4;
var tronco_u_b = 5;
var tronco_u_c = 6;
var tronco_u_d = 7;
var z_offset=0;



var lower_cap =  21;
var middle_cap = 22;
var lflag=false;

//                                                                                      ARRAY OF VERTICES
var vertices = [
	vec4(-tronco,    0,   -0.5+z_offset,1.0),  //tronco ba
	vec4(0,    -tronco,   -0.5+z_offset,1.0),    // tronco bb
	vec4(tronco,     0,   -0.5+z_offset,1.0),       // tronco bc
	vec4(0.0,   tronco,   -0.5+z_offset,1.0),     // tronco bd // lower tronco 3
	vec4(-tronco,    0,     0+z_offset,1.0),
	vec4(0,    -tronco,     0+z_offset,1.0),
	vec4(tronco,     0,     0+z_offset,1.0),
	vec4(0.0,   tronco,     0+z_offset,1.0), //upper tronco 7
	vec4(-base_foliage, 0,  0+z_offset,1.0),
	vec4(0,  -base_foliage,  0+z_offset,1.0),
	vec4(base_foliage,  0,  0+z_offset,1.0),
	vec4(0.0, base_foliage,  0+z_offset,1.0), //lower chioma 11
	vec4(-middle_foliage, 0,  middle_foliage_height+z_offset,1.0),
	vec4(0,  -middle_foliage,  middle_foliage_height+z_offset,1.0),
	vec4(middle_foliage,  0,  middle_foliage_height+z_offset,1.0),
	vec4(0.0, middle_foliage,  middle_foliage_height+z_offset,1.0), //middle chioma 15
	vec4(-upper_foliage, 0,  upper_foliage_height+z_offset,1.0),
	vec4(0,  -upper_foliage,  upper_foliage_height+z_offset,1.0),
	vec4(upper_foliage,  0,  upper_foliage_height+z_offset,1.0),
	vec4(0.0, upper_foliage,  upper_foliage_height+z_offset,1.0), //upper chioma 19
	vec4(0.0, 0.0,  cap+z_offset,1.0), // higher_puntale 20
	vec4(0.0, 0.0,  middle_foliage_height+0.1+z_offset,1.0), //lower_puntale 21
	vec4(0.0, 0.0,  upper_foliage_height+0.1+z_offset,1.0) //middle_puntale	22
];

var texCoordTriangle = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(0.5, 1)
    ];
    
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];


var brown=	vec4(0.45,0.16,0.20, 1.0)
var green=  vec4(0,    1.0,   0, 1.0)


function quad(a, b, c, d, color) {
    //console.log(a,b,c,d,color);
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[a]);
    var normal = cross(t1, t2);
    normal = vec3(normal);


    positionsArray.push(vertices[a]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);

    positionsArray.push(vertices[b]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[1]);

    positionsArray.push(vertices[d]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[2]);

    positionsArray.push(vertices[b]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);

    positionsArray.push(vertices[c]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[2]);

    positionsArray.push(vertices[d]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[3]);

}


function cap_foliage(a, b, c, d, e) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[e], vertices[a]);
     var normal_face_1 = cross(t1, t2);
     normal_face_1 = vec3(normal_face_1);
     
     var t1 = subtract(vertices[a], vertices[d]);
     var t2 = subtract(vertices[e], vertices[d]);
     var normal_face_2 = cross(t1, t2);
     normal_face_2 = vec3(normal_face_2);
     
     var t1 = subtract(vertices[d], vertices[c]);
     var t2 = subtract(vertices[e], vertices[c]);
     var normal_face_3 = cross(t1, t2);
     normal_face_3 = vec3(normal_face_3);
     
     var t1 = subtract(vertices[c], vertices[b]);
     var t2 = subtract(vertices[e], vertices[b]);
     var normal_face_4 = cross(t1, t2);
     normal_face_4 = vec3(normal_face_4);



     positionsArray.push(vertices[a]);
     normalsArray.push(normal_face_1);
     texCoordsArray.push(texCoordTriangle[0]);

     positionsArray.push(vertices[b]);
     normalsArray.push(normal_face_1);
     texCoordsArray.push(texCoordTriangle[1]);

     positionsArray.push(vertices[e]);
     normalsArray.push(normal_face_1);
     texCoordsArray.push(texCoordTriangle[2]);

     positionsArray.push(vertices[a]);
     normalsArray.push(normal_face_2);
     texCoordsArray.push(texCoordTriangle[0]);

     positionsArray.push(vertices[d]);
     normalsArray.push(normal_face_2);
     texCoordsArray.push(texCoordTriangle[1]);

     positionsArray.push(vertices[e]);
     normalsArray.push(normal_face_2);     
     texCoordsArray.push(texCoordTriangle[2]);

     positionsArray.push(vertices[d]);
     normalsArray.push(normal_face_3);
     texCoordsArray.push(texCoordTriangle[0]);

     positionsArray.push(vertices[c]);
     normalsArray.push(normal_face_3);
     texCoordsArray.push(texCoordTriangle[1]);

     positionsArray.push(vertices[e]);
     normalsArray.push(normal_face_3);     
     texCoordsArray.push(texCoordTriangle[2]);

     positionsArray.push(vertices[c]);
     normalsArray.push(normal_face_4);
     texCoordsArray.push(texCoordTriangle[0]);

     positionsArray.push(vertices[b]);
     normalsArray.push(normal_face_4);
     texCoordsArray.push(texCoordTriangle[1]);

     positionsArray.push(vertices[e]);
     normalsArray.push(normal_face_4);
     texCoordsArray.push(texCoordTriangle[2]);

    //console.log("CALLING ",a,b,c,d,green);  // 12 fin qua, poi chiamo quad ---> +6 = 18 ok
     quad(a,b,c,d,green); // base 
}

function single_foliage(a, b, c, d, a_up, b_up, c_up, d_up) {

     quad(a, b, b_up, a_up, green);              // face 1
     
     quad(b, c, c_up, b_up, green);           // face 3 

     quad(c, d, d_up, c_up, green);             //face 4

	 quad(d, a, a_up, d_up, green)           //face 2
	 
     quad(a, b, c, d, green);               //face bottom


}

function build_foliage()  // 18*3 = 54   //prima.. 78 vertici pushati per la chioma
{
    cap_foliage(ba, bb, bc, bd, lower_cap);    //18
    cap_foliage(ma, mb, mc, md, middle_cap); //18
    cap_foliage(ua, ub, uc, ud, ucap); // 18
}



function build_tronco_(b_a, b_b ,b_c ,b_d ,u_a ,u_b ,u_c ,u_d)  //30 vertici pushati per il tronco
{
    quad(b_a, b_b, u_b, u_a,brown);
    quad(b_b, b_c, u_c, u_b,brown);
    quad(b_c, b_d, u_d, u_c,brown);
    quad(b_d, b_a, u_a, u_d,brown);
    quad(b_a, b_b, b_c, b_d,brown);

}

	
function build_tronco()
{
	build_tronco_(tronco_b_a, tronco_b_b, tronco_b_c, tronco_b_d, tronco_u_a, tronco_u_b, tronco_u_c, tronco_u_d);
} 
	
function build_tree()
{ 
	build_foliage();
	build_tronco();
}


var uPositionLoc;
var program;
var u_limit;
var spotlightDirection = vec4(0, 0, -1, 0) ;
var texture;


function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "uTexMap"), 0);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

	var globalAmbientProduct = mult(globalAmbient, materialAmbient);
    var directionalAmbientProduct = mult(lightAmbient, materialAmbient);
    var directionalDiffuseProduct = mult(lightDiffuse, materialDiffuse);
    var directionalSpecularProduct = mult(lightSpecular, materialSpecular);
    
    var spotlightAmbientProduct = mult(spotlightAmbient, materialAmbient);
    console.log(spotlightAmbientProduct)
    var spotlightDiffuseProduct = mult(spotlightDiffuse, materialDiffuse);
    var spotlightSpecularProduct = mult(spotlightSpecular, materialSpecular);


    //tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
	build_tree();
	
	// NORMALS ARRAY
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

	// POSITIONS ARRAY
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);
    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // TEXTURE ATTRIBUTE
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);
    
	// INITIALIZE THE TEXTURE. IN THIS CASE WE TAKE IT FROM THE HTML FILE.
    var image = document.getElementById("texImage");

    configureTexture(image);

    document.getElementById("ButtonL").onclick = function(){
      lflag = !lflag;
      gl.uniform1f(gl.getUniformLocation(program,
         "uLflag"), lflag);
    };
    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
    nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

    document.getElementById("zFarSlider").onchange = function(event) {
        far = event.target.value;
    };
    document.getElementById("zNearSlider").onchange = function(event) {
        near = parseFloat(event.target.value);
    };
    document.getElementById("radiusSlider").onchange = function(event) {
       radius = parseFloat(event.target.value);
    };
    document.getElementById("thetaSlider").onchange = function(event) {
        theta = parseFloat(event.target.value)* Math.PI/180.0;
    };
    document.getElementById("phiSlider").onchange = function(event) {
        phi = parseFloat(event.target.value)* Math.PI/180.0;
    };
    document.getElementById("aspectSlider").onchange = function(event) {
        aspect = parseFloat(event.target.value);
    };
    document.getElementById("fovSlider").onchange = function(event) {
        fovy = parseFloat(event.target.value);
    };
    

    
    // DIRECTIONAL LIGHT PARAMETERS
    document.getElementById("lightDirectionX").onchange = function(event) {
        lightDirection[0] = parseFloat(event.target.value);
    };
    document.getElementById("lightDirectionY").onchange = function(event) {
        lightDirection[1] = parseFloat(event.target.value);
    };
    document.getElementById("lightDirectionZ").onchange = function(event) {
        lightDirection[2] = parseFloat(event.target.value);
    };
      
      

    // SPOTLIGHT LIGHT PARAMETERS
    document.getElementById("spotlightPositionX").onchange = function(event) {
        spotlightPosition[0] = parseFloat(event.target.value);
    };
    document.getElementById("spotlightPositionY").onchange = function(event) {
        spotlightPosition[1] = parseFloat(event.target.value);
    };
    document.getElementById("spotlightPositionZ").onchange = function(event) {
        spotlightPosition[2] = parseFloat(event.target.value);
    };
    

    document.getElementById("spotlightDirectionX").onchange = function(event) {
        spotlightDirection[0] = parseFloat(event.target.value);
    };
    document.getElementById("spotlightDirectionY").onchange = function(event) {
        spotlightDirection[1] = parseFloat(event.target.value);
    };
    document.getElementById("spotlightDirectionZ").onchange = function(event) {
        spotlightDirection[2] = parseFloat(event.target.value);
    };


	/*console.log(positionsArray);
	console.log(normalsArray);*/
	
    // DIRECTIONAL LIGHT PRODUCTS TO SHADERS
    gl.uniform4fv( gl.getUniformLocation(program,
       "uDirectionalAmbientProduct"),flatten(directionalAmbientProduct));
     
    gl.uniform4fv( gl.getUniformLocation(program,
       "uDirectionalDiffuseProduct"),flatten(directionalDiffuseProduct));
       
    gl.uniform4fv( gl.getUniformLocation(program,
       "uDirectionalSpecularProduct"),flatten(directionalSpecularProduct));

    
    // SPOTLIGHT PRODUCTS TO SHADERS
    gl.uniform4fv( gl.getUniformLocation(program,
       "uSpotlightAmbientProduct"),flatten(spotlightAmbientProduct));
    gl.uniform4fv( gl.getUniformLocation(program,
       "uSpotlightDiffuseProduct"),flatten(spotlightDiffuseProduct));
    gl.uniform4fv( gl.getUniformLocation(program,
       "uSpotlightSpecularProduct"),flatten(spotlightSpecularProduct));
       
    
    u_limit = 0.02;
    document.getElementById("spotlightLimit").onchange = function(event) {
        u_limit = event.target.value;
    };
    

       
    // Global light product
    gl.uniform4fv( gl.getUniformLocation(program,
       "uGlobalAmbientProduct"),flatten(globalAmbientProduct));
    
    // This parameter is "alone"
    gl.uniform1f( gl.getUniformLocation(program,
       "uShininess"),materialShininess);

    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    nMatrix = normalMatrix(modelViewMatrix, true);
	console.log("Direction \n", lightDirection, "SpotlightPos\n", spotlightPosition, "\nSpotlightDir\n", spotlightDirection, "\nSpotlightLim\n", u_limit, Math.cos(u_limit));
	console.log("Radius \n", radius, "\nTheta\n", theta, "\nPhi\n", phi);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix)  );
    gl.uniform4fv(gl.getUniformLocation(program, "uLightDirection"), lightDirection);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpotlightPosition"), spotlightPosition);
    
    gl.uniform4fv( gl.getUniformLocation(program,
       "u_Direction_spotlight"),flatten(spotlightDirection));
       
    gl.uniform1f( gl.getUniformLocation(program,
       "u_limit"),Math.cos(u_limit));      
	gl.drawArrays(gl.TRIANGLES,0,numPositions);

    requestAnimationFrame(render);
}

}

HW1();
