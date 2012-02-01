/*
 * Oni Apollo StratifiedJS Runtime
 * Client-side Cross-Browser implementation
 * 
 * Version: '0.13.2'
 * http://onilabs.com/apollo
 *
 * (c) 2010-2011 Oni Labs, http://onilabs.com
 *
 * This file is licensed under the terms of the MIT License:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */
var __oni_rt={};(function(exports){function augmented_message(e){













return e.message+" (in "+e.file+(e.line?":"+e.line:"")+")";

}

function CFException_toString(){return this.name+": "+augmented_message(this);

}

var token_oniE={};
function CFException(type,value,line,file){this.type=type;


if(type=="t"&&(value instanceof Error||(typeof value=="object"&&value.message))&&value._oniE!==token_oniE&&line!=="passthrough"){
value._oniE=token_oniE;
value.line=line;
value.file=file||"unknown SJS source";
value.stack="";
if(!value.hasOwnProperty('toString'))value.toString=CFException_toString;

}
this.val=value;
}
exports.CFE=function(type,value){return new CFException(type,value)};

var CFETypes={r:"return",b:"break",c:"continue"};
CFException.prototype={__oni_cfx:true,toString:function(){

if(this.type in CFETypes)return "Unexpected "+CFETypes[this.type]+" statement";else return "Uncaught internal SJS control flow exception ("+this.type+":: "+this.val+")";




},mapToJS:function(augment_mes){
if(this.type=="t"){

throw (augment_mes&&this.val.file)?new Error(augmented_message(this.val)):this.val;
}else throw this.toString();


}};






function is_ef(obj){return obj&&obj.__oni_ef;

}

function setEFProto(t){for(var p in EF_Proto)t[p]=EF_Proto[p]}




var EF_Proto={toString:function(){
return "<suspended SJS>"},__oni_ef:true,setChildFrame:function(ef,idx){


this.async=true;

this.child_frame=ef;
ef.parent=this;
ef.parent_idx=idx;
},quench:function(){






this.child_frame.quench();

},abort:function(){

return this.child_frame.abort();



},returnToParent:function(val){

if(this.swallow_bc&&(val&&val.__oni_cfx)&&(val.type=="b"||val.type=="c"))val=val.val;else if(this.swallow_r){




if((val&&val.__oni_cfx)){
if(val.type=="r")val=val.val;else if(val.type=="b"||val.type=="c"){





val=new CFException("t",new Error(val.toString()),0,this.env.file);
}
}else if(is_ef(val))val.swallow_r=true;else val=undefined;




}

if(this.async){
if(this.parent)this.parent.cont(this.parent_idx,val);else if((val&&val.__oni_cfx)){






val.mapToJS(true);
}
}else return val;


},returnToParent2:function(val){

if((val&&val.__oni_cfx)){

if(val.type=="r"&&this.swallow_r)val=val.val;

if(this.swallow_bc&&(val.type=="b"||val.type=="c"))val=val.val;

}else if(this.swallow_r){

if(is_ef(val))val.swallow_r=true;else val=undefined;



}
if(this.async){
if(this.parent)this.parent.cont(this.parent_idx,val);else if((val&&val.__oni_cfx)){






val.mapToJS(true);
}
}else return val;


}};








var token_dis={};


function execIN(node,env){if(typeof node=="function"){



try{

return node.call(env.tobj,env.aobj,env);
}catch(e){



return new CFException("t",e,0,env.file);
}
}else if(!node||node.__oni_dis!=token_dis){

return node;
}

return node.exec(node.ndata,env);
}
exports.ex=execIN;



exports.exseq=function(aobj,tobj,file,args){var rv=I_seq(args,new Env(aobj,tobj,file));

if((rv&&rv.__oni_cfx))return rv.mapToJS();

return rv;
};



function makeINCtor(exec){return function(){
return {exec:exec,ndata:arguments,__oni_dis:token_dis};





};
}





function Env(aobj,tobj,file){this.aobj=aobj;

this.tobj=tobj;
this.file=file;
}






function I_nblock(ndata,env){try{

return (ndata[0]).call(env.tobj,env.aobj);
}catch(e){

return new CFException("t",e,ndata[1],env.file);
}
}
exports.Nb=makeINCtor(I_nblock);





function I_lit(ndata,env){return ndata[0]}

exports.Lit=makeINCtor(I_lit);










function EF_Seq(ndata,env){this.ndata=ndata;

this.env=env;


this.swallow_r=ndata[0]&1;


this.sc=ndata[0]&(2|4);

}
setEFProto(EF_Seq.prototype={});
EF_Seq.prototype.cont=function(idx,val){if(is_ef(val)){


this.setChildFrame(val,idx);
}else if((val&&val.__oni_cfx)){


return this.returnToParent(val);
}else{

while(idx<this.ndata.length){
if(this.sc&&idx>1){

if(this.sc==2){
if(val)break;
}else{

if(!val)break;
}
}
this.child_frame=null;
val=execIN(this.ndata[idx],this.env);
if(this.aborted){

if(is_ef(val)){
val.quench();
val=val.abort();
}
break;
}
if(++idx==this.ndata.length||(val&&val.__oni_cfx)){

break;
}
if(is_ef(val)){
this.setChildFrame(val,idx);
return this;
}
}
return this.returnToParent(val);
}
};

EF_Seq.prototype.quench=function(){if(this.child_frame)this.child_frame.quench();

};

EF_Seq.prototype.abort=function(){if(!this.child_frame){



this.aborted=true;
return this;
}else return this.child_frame.abort();


};

function I_seq(ndata,env){return (new EF_Seq(ndata,env)).cont(1);

}

exports.Seq=makeINCtor(I_seq);









function EF_Scall(ndata,env){this.ndata=ndata;

this.env=env;
this.i=2;
this.pars=[];
}
setEFProto(EF_Scall.prototype={});

EF_Scall.prototype.cont=function(idx,val){if(is_ef(val)){

this.setChildFrame(val,idx);
}else if((val&&val.__oni_cfx)){

return this.returnToParent(val);
}else{

if(idx==1){

this.pars.push(val);
}
var rv;
while(this.i<this.ndata.length){
rv=execIN(this.ndata[this.i],this.env);
++this.i;
if((rv&&rv.__oni_cfx))return this.returnToParent(rv);
if(is_ef(rv)){
this.setChildFrame(rv,1);
return this;
}
this.pars.push(rv);
}


try{
rv=this.ndata[1].apply(this.env.tobj,this.pars);
}catch(e){





rv=new CFException("t",e,this.ndata[0],this.env.file);


}
return this.returnToParent(rv);
}
};

function I_scall(ndata,env){return (new EF_Scall(ndata,env)).cont(0);

}

exports.Scall=makeINCtor(I_scall);














function EF_Sc(ndata,env){this.ndata=ndata;

this.env=env;
this.i=2;
this.pars=[];
}
setEFProto(EF_Sc.prototype={});

EF_Sc.prototype.cont=function(idx,val){if(is_ef(val)){

this.setChildFrame(val,idx);
}else if((val&&val.__oni_cfx)){

return this.returnToParent(val);
}else{

if(idx==1){

this.pars.push(val);
}
var rv;
while(this.i<this.ndata.length){
rv=execIN(this.ndata[this.i],this.env);
++this.i;
if((rv&&rv.__oni_cfx))return this.returnToParent(rv);
if(is_ef(rv)){
this.setChildFrame(rv,1);
return this;
}
this.pars.push(rv);
}


try{
rv=this.ndata[1](this.env,this.pars);
}catch(e){

rv=new CFException("t",e,this.ndata[0],this.env.file);


}
return this.returnToParent(rv);
}
};

function I_sc(ndata,env){return (new EF_Sc(ndata,env)).cont(0);

}

exports.Sc=makeINCtor(I_sc);







function testIsFunction(f){if(typeof f=="function")return true;










return !!/(?:\[[^o])|(?:^\/)/.exec(""+f);
}







function EF_Fcall(ndata,env){this.ndata=ndata;

this.env=env;
this.i=2;
this.pars=[];
}
setEFProto(EF_Fcall.prototype={});

EF_Fcall.prototype.cont=function(idx,val){if(is_ef(val)){

this.setChildFrame(val,idx);
}else if((val&&val.__oni_cfx)){

return this.returnToParent(val);
}else if(idx==2){


return this.returnToParent(this.o);
}else{

if(idx==1){

if(this.i==3)this.l=val;else this.pars.push(val);



}
var rv;
while(this.i<this.ndata.length){
rv=execIN(this.ndata[this.i],this.env);
++this.i;
if((rv&&rv.__oni_cfx))return this.returnToParent(rv);
if(is_ef(rv)){
this.setChildFrame(rv,1);
return this;
}
if(this.i==3)this.l=rv;else this.pars.push(rv);



}


try{
switch(this.ndata[0]){case 0:



if(typeof this.l=="function"&&this.l.apply)rv=this.l.apply(null,this.pars);else if(!testIsFunction(this.l)){


rv=new CFException("t",new Error("'"+this.l+"' is not a function"),this.ndata[1],this.env.file);



}else{



var command="this.l(";
for(var i=0;i<this.pars.length;++i){
if(i)command+=",";
command+="this.pars["+i+"]";
}
command+=")";
rv=eval(command);
}
break;
case 1:

if(this.l[0]===undefined){
rv=new CFException("t",new Error("'"+this.l[1]+"' on '"+this.l[0]+"' is not a function"),this.ndata[1],this.env.file);



}else if(typeof this.l[0][this.l[1]]=="function"){



rv=this.l[0][this.l[1]].apply(this.l[0],this.pars);
}else if((UA!="msie")&&!testIsFunction(this.l[0][this.l[1]])){






rv=new CFException("t",new Error("'"+this.l[0][this.l[1]]+"' is not a function"),this.ndata[1],this.env.file);



}else{



var command="this.l[0][this.l[1]](";
for(var i=0;i<this.pars.length;++i){
if(i)command+=",";
command+="this.pars["+i+"]";
}
command+=")";
rv=eval(command);
}
break;
case 2:




var ctor=this.l;
if(ctor&&(ctor==Array||ctor==Boolean||ctor==Date||ctor==Error||ctor==EvalError||ctor==Function||ctor==Math||ctor==Number||ctor==Object||ctor==RangeError||ctor==ReferenceError||ctor==RegExp||ctor==String||ctor==SyntaxError||ctor==TypeError||ctor==URIError||ctor==window.XMLHttpRequest||ctor==window.ActiveXObject||ctor==window.XDomainRequest||!ctor.apply)){






var command="new ctor(";
for(var i=0;i<this.pars.length;++i){
if(i)command+=",";
command+="this.pars["+i+"]";
}
command+=")";
rv=eval(command);
}else if(!testIsFunction(ctor)){

rv=new CFException("t",new Error("'"+ctor+"' is not a function"),this.ndata[1],this.env.file);



}else{



var f=new Function();
f.prototype=ctor.prototype;
this.o=new f();
rv=ctor.apply(this.o,this.pars);
if(is_ef(rv)){

this.setChildFrame(rv,2);
return this;
}else{



if(!rv||"object function".indexOf(typeof rv)==-1)rv=this.o;

}
}
break;
default:
rv=new CFException("i","Invalid Fcall mode");
}
}catch(e){







rv=new CFException("t",e,this.ndata[1],this.env.file);


}
return this.returnToParent(rv);
}
};

function I_fcall(ndata,env){return (new EF_Fcall(ndata,env)).cont(0);

}

exports.Fcall=makeINCtor(I_fcall);








function EF_If(ndata,env){this.ndata=ndata;

this.env=env;
}
setEFProto(EF_If.prototype={});

EF_If.prototype.cont=function(idx,val){switch(idx){case 0:



val=execIN(this.ndata[0],this.env);

case 1:
if((val&&val.__oni_cfx))break;
if(is_ef(val)){
this.setChildFrame(val,1);
return this;
}

if(val)val=execIN(this.ndata[1],this.env);else val=execIN(this.ndata[2],this.env);



break;
default:
val=new CFException("i","invalid state in EF_If");
}
return this.returnToParent(val);
};

function I_if(ndata,env){return (new EF_If(ndata,env)).cont(0);

}

exports.If=makeINCtor(I_if);





var Default={};
exports.Default=Default;





function EF_Switch(ndata,env){this.ndata=ndata;

this.env=env;
this.phase=0;
}
setEFProto(EF_Switch.prototype={});



EF_Switch.prototype.swallow_bc=true;

EF_Switch.prototype.cont=function(idx,val){switch(this.phase){case 0:


if(idx==0){
val=execIN(this.ndata[0],this.env);
}
if((val&&val.__oni_cfx))return this.returnToParent(val);
if(is_ef(val)){
this.setChildFrame(val,1);
return this;
}
this.phase=1;
this.testval=val;
idx=-1;
case 1:
while(true){
if(idx>-1){
if((val&&val.__oni_cfx))return this.returnToParent(val);
if(is_ef(val)){
this.setChildFrame(val,idx);
return this;
}else if(val==Default||val==this.testval)break;


}
if(++idx>=this.ndata[1].length)return this.returnToParent(null);


val=execIN(this.ndata[1][idx][0],this.env);
}
this.phase=2;
val=0;
case 2:
while(idx<this.ndata[1].length){
if(is_ef(val)){
this.setChildFrame(val,idx);
return this;
}
if((val&&val.__oni_cfx)){
return this.returnToParent(val);
}
val=execIN(this.ndata[1][idx][1],this.env);
++idx;
}

if(is_ef(val))val.swallow_bc=true;
return this.returnToParent(val);
default:
throw "Invalid phase in Switch SJS node";
}
};

function I_switch(ndata,env){return (new EF_Switch(ndata,env)).cont(0);

}

exports.Switch=makeINCtor(I_switch);











function EF_Try(ndata,env){this.ndata=ndata;

this.env=env;
this.state=0;
}
setEFProto(EF_Try.prototype={});

EF_Try.prototype.cont=function(idx,val){if(is_ef(val)){

this.setChildFrame(val,this.state);
}else{

switch(this.state){case 0:

this.state=1;
val=execIN(this.ndata[1],this.env);
if(is_ef(val)){
this.setChildFrame(val);
return this;
}
case 1:

this.state=2;
if(!this.aborted&&this.ndata[2]&&(((val&&val.__oni_cfx)&&val.type=="t")||this.ndata[0]&1)){



try{
var v;
if(this.ndata[0]&1){


v=(val&&val.__oni_cfx)?[val.val,true]:[val,false];
}else v=val.val;


val=this.ndata[2](this.env,v);
}catch(e){


val=new CFException("t",e);
}
if(is_ef(val)){
this.setChildFrame(val);
return this;
}
}
case 2:

this.state=3;


this.rv=val;
if(this.aborted&&this.ndata[4]){
val=execIN(this.ndata[4],this.env);
if(is_ef(val)){
this.setChildFrame(val);
return this;
}
}
case 3:

this.state=4;
if(this.ndata[3]){
val=execIN(this.ndata[3],this.env);


if(is_ef(val)){
this.setChildFrame(val);
return this;
}
}
case 4:



if((this.rv&&this.rv.__oni_cfx)&&!(val&&val.__oni_cfx)){
val=this.rv;
}
break;
default:
val=new CFException("i","invalid state in CF_Try");
}
return this.returnToParent(val);
}
};

EF_Try.prototype.quench=function(){if(this.state!=4)this.child_frame.quench();


};

EF_Try.prototype.abort=function(){delete this.parent;



this.aborted=true;


if(this.state!=4){
var val=this.child_frame.abort();
if(is_ef(val)){


this.setChildFrame(val);
}else{


if(this.cont(0,undefined)!=this)return;


}
}
return this;
};

function I_try(ndata,env){return (new EF_Try(ndata,env)).cont(0);

}

exports.Try=makeINCtor(I_try);








function EF_Loop(ndata,env){this.ndata=ndata;

this.env=env;
}
setEFProto(EF_Loop.prototype={});

EF_Loop.prototype.cont=function(idx,val){if(is_ef(val)){

this.setChildFrame(val,idx);
}else{

while(true){

if(idx==0){
if((val&&val.__oni_cfx)){

return this.returnToParent(val);
}

val=execIN(this.ndata[1],this.env);
if(is_ef(val)){
this.setChildFrame(val,2);
return this;
}
idx=2;
}

if(idx>1){
if(idx==2){

if(!val||(val&&val.__oni_cfx)){

return this.returnToParent(val);
}
}
while(1){
if(idx>2){
if((val&&val.__oni_cfx)){
if(val.type=="b"){

val=undefined;
}else if(val.type=="c"){


val=undefined;

break;
}
return this.returnToParent(val);
}
if(idx>=this.ndata.length)break;

}


val=execIN(this.ndata[idx+1],this.env);
++idx;
if(is_ef(val)){
this.setChildFrame(val,idx);
return this;
}
}
idx=1;
}

if(this.ndata[2]){

val=execIN(this.ndata[2],this.env);
if(is_ef(val)){
this.setChildFrame(val,0);
return this;
}
}
idx=0;
}
}
};

function I_loop(ndata,env){return (new EF_Loop(ndata,env)).cont(ndata[0],true);

}

exports.Loop=makeINCtor(I_loop);








function EF_ForIn(ndata,env){this.ndata=ndata;

this.env=env;
}
setEFProto(EF_ForIn.prototype={});

EF_ForIn.prototype.cont=function(idx,val){if(is_ef(val)){

this.setChildFrame(val,idx);
}else{

if(idx==0){
val=execIN(this.ndata[0],this.env);
if(is_ef(val)){
this.setChildFrame(val,1);
return this;
}
idx=1;
}
if(idx==1){

if((val&&val.__oni_cfx))return this.returnToParent(val);

for(var x in val){
if(this.remainingX===undefined){
val=this.ndata[1](this.env,x);
if((val&&val.__oni_cfx)){
if(val.type=="b"){

val=undefined;
}else if(val.type=="c"){


val=undefined;
continue;
}
return this.returnToParent(val);
}
if(is_ef(val))this.remainingX=[];

}else this.remainingX.push(x);


}
if(is_ef(val)){

if(!this.remainingX.length){
val.swallow_bc=true;
return this.returnToParent(val);
}else{

this.setChildFrame(val,2);
return this;
}
}

return this.returnToParent(val);
}
if(idx==2){
while(1){

if((val&&val.__oni_cfx)){
if(val.type=="b"){

val=undefined;
}else if(val.type=="c"){


val=undefined;
if(this.remainingX.length)continue;

}
return this.returnToParent(val);
}
if(!this.remainingX.length){

if(is_ef(val))val.swallow_bc=true;
return this.returnToParent(val);
}
val=this.ndata[1].apply(this.env.tobj,[this.env.aobj,this.remainingX.shift()]);


if(is_ef(val)){
this.setChildFrame(val,2);
return this;
}

}
}
}
};

function I_forin(ndata,env){return (new EF_ForIn(ndata,env)).cont(0);

}

exports.ForIn=makeINCtor(I_forin);






function I_cfe(ndata,env){return new CFException(ndata[0],ndata[1]);

}

exports.Cfe=makeINCtor(I_cfe);








function EF_Par(ndata,env){this.ndata=ndata;

this.env=env;
this.pending=0;
this.children=new Array(this.ndata.length);
}
setEFProto(EF_Par.prototype={});

EF_Par.prototype.cont=function(idx,val){if(is_ef(val)){

this.setChildFrame(val,idx);
}else{

if(idx==-1){

for(var i=0;i<this.ndata.length;++i){
val=execIN(this.ndata[i],this.env);
if(this.aborted){


if(is_ef(val)){
++this.pending;
this.setChildFrame(val,i);
this.quench();
return this.abortInner();
}
return this.pendingCFE;
}else if(is_ef(val)){

++this.pending;
this.setChildFrame(val,i);
}else if((val&&val.__oni_cfx)){


this.pendingCFE=val;
this.quench();
return this.abortInner();
}
}
}else{


--this.pending;
this.children[idx]=undefined;
if((val&&val.__oni_cfx)&&!this.aborted){

this.pendingCFE=val;
this.quench();
return this.returnToParent(this.abortInner());
}
}
if(this.pending<2){
if(!this.pendingCFE){


if(this.pending==0)return this.returnToParent(val);


for(var i=0;i<this.children.length;++i)if(this.children[i])return this.returnToParent(this.children[i]);


return this.returnToParent(new CFException("i","invalid state in Par"));
}else{



if(this.pending==0)return this.returnToParent(this.pendingCFE);

}
}
this.async=true;
return this;
}
};

EF_Par.prototype.quench=function(){if(this.aborted)return;

for(var i=0;i<this.children.length;++i){
if(this.children[i])this.children[i].quench();

}
};

EF_Par.prototype.abort=function(){delete this.parent;



if(this.aborted){


delete this.pendingCFE;
return this;
}
return this.abortInner();
};

EF_Par.prototype.abortInner=function(){this.aborted=true;




for(var i=0;i<this.children.length;++i)if(this.children[i]){

var val=this.children[i].abort();
if(is_ef(val))this.setChildFrame(val,i);else{


--this.pending;
this.children[i]=undefined;
}
}
if(!this.pending)return this.pendingCFE;


this.async=true;
return this;
};

EF_Par.prototype.setChildFrame=function(ef,idx){this.children[idx]=ef;

ef.parent=this;
ef.parent_idx=idx;
};

function I_par(ndata,env){return (new EF_Par(ndata,env)).cont(-1);

}

exports.Par=makeINCtor(I_par);








function EF_Alt(ndata,env){this.ndata=ndata;

this.env=env;

this.pending=0;
this.children=new Array(this.ndata.length);
}
setEFProto(EF_Alt.prototype={});

EF_Alt.prototype.cont=function(idx,val){if(is_ef(val)){

this.setChildFrame(val,idx);
}else{

if(idx==-1){

for(var i=0;i<this.ndata.length;++i){


var env=new Env(this.env.aobj,this.env.tobj,this.env.file);
env.fold=this;
env.branch=i;
val=execIN(this.ndata[i],env);

if(this.aborted){


if(is_ef(val)){
++this.pending;
this.setChildFrame(val,i);
this.quench();
return this.abortInner();
}
return this.pendingRV;
}else if(is_ef(val)){

++this.pending;
this.setChildFrame(val,i);
}else{


this.pendingRV=val;
this.quench();
return this.abortInner();
}
}
}else{


--this.pending;
this.children[idx]=undefined;
if(this.collapsing){


if(this.pending==1){

cf=this.collapsing.cf;
delete this.collapsing;
cf.cont(1);
}
return;
}else{



if(!this.aborted){
this.pendingRV=val;
this.quench();
return this.returnToParent(this.abortInner());
}
if(this.pending==0)return this.returnToParent(this.pendingRV);

}
}
this.async=true;
return this;
}
};

EF_Alt.prototype.quench=function(except){if(this.aborted)return;

if(this.collapsing){

this.children[this.collapsing.branch].quench();
}else{


for(var i=0;i<this.children.length;++i){
if(i!==except&&this.children[i])this.children[i].quench();

}
}
};

EF_Alt.prototype.abort=function(){delete this.parent;

if(this.aborted){
delete this.pendingRV;
return this;
}
return this.abortInner();
};

EF_Alt.prototype.abortInner=function(){this.aborted=true;


if(this.collapsing){

var branch=this.collapsing.branch;
delete this.collapsing;
var val=this.children[branch].abort();
if(is_ef(val))this.setChildFrame(val,branch);else{


--this.pending;
this.children[branch]=undefined;
}
}else{


for(var i=0;i<this.children.length;++i)if(this.children[i]){

var val=this.children[i].abort();
if(is_ef(val))this.setChildFrame(val,i);else{


--this.pending;
this.children[i]=undefined;
}
}
}
if(!this.pending)return this.pendingRV;

this.async=true;
return this;
};

EF_Alt.prototype.setChildFrame=function(ef,idx){this.children[idx]=ef;

ef.parent=this;
ef.parent_idx=idx;
};

EF_Alt.prototype.docollapse=function(branch,cf){this.quench(branch);


for(var i=0;i<this.children.length;++i){
if(i==branch)continue;
if(this.children[i]){
var val=this.children[i].abort();
if(is_ef(val))this.setChildFrame(val,i);else{


--this.pending;
this.children[i]=undefined;
}
}
}

if(this.pending<=1)return true;




this.collapsing={branch:branch,cf:cf};
return false;
};

function I_alt(ndata,env){return (new EF_Alt(ndata,env)).cont(-1);

}

exports.Alt=makeINCtor(I_alt);









function EF_Suspend(ndata,env){this.ndata=ndata;

this.env=env;
}
setEFProto(EF_Suspend.prototype={});

EF_Suspend.prototype.cont=function(idx,val){if(is_ef(val)){


this.setChildFrame(val,idx);
}else{

switch(idx){case 0:

try{
var ef=this;

var resumefunc=function(){try{

ef.cont(2,arguments);
}catch(e){

var s=function(){throw e};
setTimeout(s,0);
}
};


val=this.ndata[0](this.env,resumefunc);
}catch(e){


val=new CFException("t",e);
}



if(this.returning){

if(is_ef(val)){


this.setChildFrame(val,null);
this.quench();
val=this.abort();
if(is_ef(val)){

this.setChildFrame(val,3);

this.async=true;
return this;
}

}
return this.cont(3,null);
}

if(is_ef(val)){
this.setChildFrame(val,1);
return this;
}
case 1:

if((val&&val.__oni_cfx)){
this.returning=true;
break;
}
this.suspendCompleted=true;

this.async=true;
return this;
case 2:



if(this.returning){

return;
}
this.returning=true;
if((val&&val.__oni_cfx)){


val=new CFException("i","Suspend: Resume function threw ("+val.toString()+")");
break;
}
this.retvals=val;
if(!this.suspendCompleted){

if(!this.child_frame){



this.returning=true;
return;
}else{

this.quench();
val=this.abort();
if(is_ef(val)){

this.setChildFrame(val,3);
return this;
}


}
}
case 3:

try{
this.ndata[1].apply(this.env,this.retvals);
val=undefined;
}catch(e){

val=new CFException("i","Suspend: Return function threw ("+e+")");
}
break;
default:
val=new CFException("i","Invalid state in Suspend ("+idx+")");
}
return this.returnToParent(val);
}
};

EF_Suspend.prototype.quench=function(){this.returning=true;

if(!this.suspendCompleted)this.child_frame.quench();

};

EF_Suspend.prototype.abort=function(){this.returning=true;


if(!this.suspendCompleted)return this.child_frame.abort();

};

function I_sus(ndata,env){return (new EF_Suspend(ndata,env)).cont(0);

}

exports.Suspend=makeINCtor(I_sus);










function EF_Spawn(ndata,env,notifyAsync,notifyVal){this.ndata=ndata;

this.env=env;
this.notifyAsync=notifyAsync;
this.notifyVal=notifyVal;
}
setEFProto(EF_Spawn.prototype={});

EF_Spawn.prototype.cont=function(idx,val){if(idx==0)val=execIN(this.ndata[1],this.env);



if(is_ef(val)){
this.setChildFrame(val,1);
if(idx==0)this.notifyAsync();

}else{

this.notifyVal(val);
}
};

function EF_SpawnWaitFrame(waitarr){this.waitarr=waitarr;

waitarr.push(this);
}
setEFProto(EF_SpawnWaitFrame.prototype={});
EF_SpawnWaitFrame.prototype.quench=function(){};
EF_SpawnWaitFrame.prototype.abort=function(){var idx=this.waitarr.indexOf(this);

this.waitarr.splice(idx,1);
};
EF_SpawnWaitFrame.prototype.cont=function(val){if(this.parent)this.parent.cont(this.parent_idx,val);


};

function I_spawn(ndata,env){var val,async,have_val,picked_up=false;

var waitarr=[];
var stratum={abort:function(){
if(!async)return;

ef.quench();
ef.abort();
async=false;
val=new CFException("t",new Error("stratum aborted"),ndata[0],env.file);



while(waitarr.length)waitarr.shift().cont(val);

},waitforValue:function(){
if(!async){
picked_up=true;return val}
return new EF_SpawnWaitFrame(waitarr);
},waiting:function(){
return waitarr.length;

}};


function notifyAsync(){async=true;

}
function notifyVal(_val){val=_val;

async=false;
if(!waitarr.length){




if((val&&val.__oni_cfx)&&val.val instanceof Error){







setTimeout(function(){if(!picked_up)val.mapToJS(true);







},0);

}
}else while(waitarr.length)waitarr.shift().cont(val);




}
var ef=new EF_Spawn(ndata,env,notifyAsync,notifyVal);
ef.cont(0);
return stratum;
}

exports.Spawn=makeINCtor(I_spawn);










function EF_Collapse(ndata,env){this.ndata=ndata;

this.env=env;
}
setEFProto(EF_Collapse.prototype={});


EF_Collapse.prototype.__oni_collapse=true;

EF_Collapse.prototype.cont=function(idx,val){if(idx==0){

var fold=this.env.fold;
if(!fold)return new CFException("t",new Error("Unexpected collapse statement"),this.ndata[0],this.env.file);


if(fold.docollapse(this.env.branch,this))return true;


this.async=true;
return this;
}else if(idx==1)this.returnToParent(true);else this.returnToParent(new CFException("t","Internal error in SJS runtime (collapse)",this.ndata[0],this.env.file));





};


EF_Collapse.prototype.quench=function(){};
EF_Collapse.prototype.abort=function(){};

function I_collapse(ndata,env){return (new EF_Collapse(ndata,env)).cont(0);

}

exports.Collapse=makeINCtor(I_collapse);




function dummy(){}

exports.Hold=function(){if(!arguments.length)return {__oni_ef:true,quench:dummy,abort:dummy};


var sus={__oni_ef:true,abort:dummy,quench:function(){

sus=null;clearTimeout(this.co)}};

sus.co=setTimeout(function(){if(sus&&sus.parent)sus.parent.cont(sus.parent_idx,undefined)},arguments[0]);

return sus;
};

exports.Throw=function(exp,line,file){return new CFException("t",exp,line,file)};

exports.Arr=function(){return Array.prototype.slice.call(arguments,0)};

exports.Obj=function(){var obj=new Object();



for(var i=0;i<arguments[0].length;++i)obj[arguments[0][i]]=arguments[i+1];

return obj;
};

exports.Return=function(exp){return new CFException("r",exp);

};

exports.With=function(env,args){return args[1](env,args[0]);

};

exports.infix={'+':function(a,b){
return a+b},'-':function(a,b){
return a-b},'*':function(a,b){
return a*b},'/':function(a,b){
return a/b},'%':function(a,b){
return a%b},'<<':function(a,b){
return a<<b},'>>':function(a,b){
return a>>b},'>>>':function(a,b){
return a>>>b},'<':function(a,b){
return a<b},'>':function(a,b){
return a>b},'<=':function(a,b){
return a<=b},'>=':function(a,b){
return a>=b},'==':function(a,b){
return a==b},'!=':function(a,b){
return a!=b},'===':function(a,b){
return a===b},'!==':function(a,b){
return a!==b},'&':function(a,b){
return a&b},'^':function(a,b){
return a^b},'|':function(a,b){
return a|b},',':function(a,b){
return a,b},'instanceof':function(a,b){

return a instanceof b},'in':function(a,b){
return a in b}};




var UA=navigator.userAgent.toLowerCase();
if(UA.indexOf(" chrome/")>=0)UA="chrome";else if(UA.indexOf(" firefox/")>=0)UA="firefox";else if(UA.indexOf(" safari/")>=0)UA="safari";else if(UA.indexOf(" msie ")>=0)UA="msie";else UA="unknown";









exports.hostenv="xbrowser";
exports.UA=UA;

exports.G=window;

exports.modules={};exports.modsrc={};})(__oni_rt);(function(exports){function push_decl_scope(pctx){





















pctx.decl_scopes.push({vars:[],funs:"",fscoped_ctx:0});

}
function pop_decl_scope(pctx){var decls=pctx.decl_scopes.pop();

var rv="";
if(decls.vars.length)rv+="var "+decls.vars.join(",")+";";

rv+=decls.funs;
return rv;
}

function top_decl_scope(pctx){return pctx.decl_scopes[pctx.decl_scopes.length-1];

}

function push_stmt_scope(pctx){pctx.stmt_scopes.push({seq:[]});

}
function pop_stmt_scope(pctx,pre,post){var seq=pctx.stmt_scopes.pop().seq;

var rv="";
if(seq.length){
if(pctx.nb_ctx==0){
if(pre)rv+=pre;

for(var i=0;i<seq.length;++i){
var v=seq[i].v();
if(v.length){
if(i||pre)rv+=",";
rv+=v;
}
}
if(post)rv+=post;

}else{


for(var i=0;i<seq.length;++i)rv+=seq[i].nb();

}
}
return rv;
}

function top_stmt_scope(pctx){return pctx.stmt_scopes[pctx.stmt_scopes.length-1];

}









function begin_script(pctx){if(pctx.filename)pctx.fn=pctx.filename.replace(/\'/g,"\\\'");









switch(pctx.mode){case "debug":

pctx.allow_nblock=false;
pctx.full_nblock=false;
break;
case "optimize":
pctx.allow_nblock=true;
pctx.full_nblock=true;
break;
case "normal":
default:
pctx.allow_nblock=true;
pctx.full_nblock=false;
}


if(pctx.full_nblock){
nblock_val_to_val=function(v,r,l){var rv="function(arguments){";

if(r)rv+="return ";
rv+=v;
return rv+"}";
};
}else{



nblock_val_to_val=function(v,r,l){var rv="__oni_rt.Nb(function(arguments){";

if(r)rv+="return ";
rv+=v;
return rv+"},"+l+")";
};
}

if(pctx.scopes!==undefined)throw "Internal parser error: Nested script";

pctx.decl_scopes=[];
pctx.stmt_scopes=[];

pctx.nb_ctx=0;

push_decl_scope(pctx);
push_stmt_scope(pctx);
}



function add_stmt(stmt,pctx){if(!stmt)return;

if(stmt.is_compound_stmt){

for(var i=0;i<stmt.stmts.length;++i)add_stmt(stmt.stmts[i],pctx);

return;
}else if(stmt.is_var_decl){

top_decl_scope(pctx).vars.push(stmt.decl());
if(stmt.is_empty)return;


}else if(stmt.is_fun_decl){

top_decl_scope(pctx).funs+=stmt.decl();
return;
}


var seq=top_stmt_scope(pctx).seq;
if(stmt.is_nblock&&pctx.nb_ctx==0){

var last=seq.length?seq[seq.length-1]:null;
if(!last||!last.is_nblock_seq){
last=new ph_nblock_seq(pctx);
seq.push(last);
}
last.pushStmt(stmt);
}else seq.push(stmt);


}

function end_script(pctx){var rv="";

rv+=pop_decl_scope(pctx);
rv+=pop_stmt_scope(pctx,"__oni_rt.exseq(this.arguments,this,'"+pctx.fn+"',["+0,"])");



return rv;
}





function pop_block(pctx){if(top_stmt_scope(pctx).seq.length==1){

var stmt=pctx.stmt_scopes.pop().seq[0];

stmt.is_var_decl=false;
return stmt;
}else return new ph_block(pop_stmt_scope(pctx));


}




var nblock_val_to_val;

function ph(){}

ph.prototype={is_nblock:false,v:function(accept_list){


if(this.is_nblock&&this.nblock_val)return nblock_val_to_val(this.nblock_val(),this.is_value,this.line);else return this.val(accept_list);




},nb:function(){

if(this.nblock_val)return this.nblock_val();else throw "Illegal statement in __js block";






}};





function ph_block(seq){this.seq=seq;

}
ph_block.prototype=new ph();
ph_block.prototype.nblock_val=function(){return this.seq;

};
ph_block.prototype.val=function(accept_list){return this.seq.length?(accept_list?this.seq:"__oni_rt.Seq("+0+","+this.seq+")"):"0";




};




function ph_switch(exp,clauses){this.exp=exp;

this.clauses=clauses;
}
ph_switch.prototype=new ph();
ph_switch.prototype.val=function(){var clauses="["+this.clauses.join(",")+"]";

return "__oni_rt.Switch("+this.exp.v()+","+clauses+")";
};







function ph_fun_exp(fname,pars,body,pctx){this.is_nblock=pctx.allow_nblock;














this.code="function "+fname+"("+pars.join(",")+"){"+body+"}";
}
ph_fun_exp.prototype=new ph();

ph_fun_exp.prototype.v=function(){return "__oni_rt.Lit("+this.code+")";

};
ph_fun_exp.prototype.nblock_val=function(){return this.code};

function gen_fun_decl(fname,pars,body,pctx){if(top_decl_scope(pctx).fscoped_ctx){



return gen_var_decl([[fname,new ph_fun_exp("",pars,body,pctx)]],pctx);
}else return new ph_fun_decl(fname,pars,body,pctx);


}

function ph_fun_decl(fname,pars,body,pctx){this.code="function "+fname+"("+pars.join(",")+"){"+body+"}";

}
ph_fun_decl.prototype=new ph();
ph_fun_decl.prototype.is_fun_decl=true;

ph_fun_decl.prototype.decl=function(){return this.code};






function ph_nblock_seq(){this.stmts=[];

}
ph_nblock_seq.prototype=new ph();
ph_nblock_seq.prototype.is_nblock=true;
ph_nblock_seq.prototype.is_nblock_seq=true;
ph_nblock_seq.prototype.pushStmt=function(stmt){this.stmts.push(stmt);

if(this.line===undefined)this.line=this.stmts[0].line;
};
ph_nblock_seq.prototype.nblock_val=function(){var rv="";

for(var i=0;i<this.stmts.length-1;++i){
rv+=this.stmts[i].nb();
}
if(this.stmts[i].is_value)rv+="return ";

rv+=this.stmts[i].nb();
return rv;
};


function ph_compound_stmt(pctx){this.stmts=[];

this.pctx=pctx;
}
ph_compound_stmt.prototype=new ph();
ph_compound_stmt.prototype.is_compound_stmt=true;
ph_compound_stmt.prototype.toBlock=function(){push_stmt_scope(this.pctx);

add_stmt(this,this.pctx);
return pop_block(this.pctx);
};

function ph_exp_stmt(exp,pctx){this.exp=exp;

this.line=this.exp.line;
this.is_nblock=exp.is_nblock;
}
ph_exp_stmt.prototype=new ph();
ph_exp_stmt.prototype.is_value=true;
ph_exp_stmt.prototype.nblock_val=function(){return this.exp.nb()+";"};
ph_exp_stmt.prototype.val=function(){return this.exp.v()};


function gen_var_compound(decls,pctx){var rv=new ph_compound_stmt(pctx);

for(var i=0;i<decls.length;++i)rv.stmts.push(new ph_var_decl(decls[i],pctx));

return rv;
}

function gen_var_decl(decls,pctx){return gen_var_compound(decls,pctx).toBlock();

}

function ph_var_decl(d,pctx){this.d=d;

this.is_empty=this.d.length<2;
this.line=pctx.line;
if(!this.is_empty)this.is_nblock=pctx.allow_nblock&&d[1].is_nblock;

}
ph_var_decl.prototype=new ph();
ph_var_decl.prototype.is_var_decl=true;
ph_var_decl.prototype.decl=function(){return this.d[0]};
ph_var_decl.prototype.nblock_val=function(){;

return this.d[0]+"="+this.d[1].nb()+";";
};
ph_var_decl.prototype.val=function(){;


return "__oni_rt.Scall("+this.line+",function(_oniX){return "+this.d[0]+"=_oniX;},"+this.d[1].v()+")";

};

function ph_if(t,c,a,pctx){this.t=t;

this.c=c;
this.a=a;
this.line=t.line;
this.file=pctx.fn;

this.is_nblock=pctx.full_nblock&&t.is_nblock&&c.is_nblock&&(!a||a.is_nblock);

}
ph_if.prototype=new ph();
ph_if.prototype.nblock_val=function(){var rv="if("+this.t.nb()+"){"+this.c.nb()+"}";

if(this.a)rv+="else{"+this.a.nb()+"}";

return rv;
};

ph_if.prototype.val=function(){var rv;

var c=this.c?this.c.v():"0";
if(this.t.is_nblock){


rv="function(arguments, __oni_env){if("+this.t.nb()+")return __oni_rt.ex("+c+",__oni_env);";

if(this.a)rv+="else return __oni_rt.ex("+this.a.v()+",__oni_env);";

return rv+"}";
}else{


rv="__oni_rt.If("+this.t.v()+","+c;
if(this.a)rv+=","+this.a.v();

return rv+")";
}
};



function ph_try(block,crf,pctx){this.block=block;

this.crf=crf;
this.file=pctx.fn;
}
ph_try.prototype=new ph();
ph_try.prototype.val=function(){var tb=this.block.v();

if(!tb.length)tb="0";
var rv="__oni_rt.Try("+((this.crf[0]&&this.crf[0][2])?1:0);
rv+=","+tb;
if(this.crf[0]){
var cb=this.crf[0][1].v();
rv+=",function(__oni_env,"+this.crf[0][0]+"){";
if(cb.length)rv+="return __oni_rt.ex("+cb+",__oni_env)";

rv+="}";
}else rv+=",0";



if(this.crf[2]){
var fb=this.crf[2].v();
if(!fb.length)fb="0";
rv+=","+fb;
}else rv+=",0";



if(this.crf[1]){
var rb=this.crf[1].v();
if(rb.length)rv+=","+rb;

}
return rv+")";
};


function ph_throw(exp,pctx){this.exp=exp;

this.line=exp.line;
this.file=pctx.fn;
this.is_nblock=pctx.full_nblock&&exp.is_nblock;
}
ph_throw.prototype=new ph();
ph_throw.prototype.nblock_val=function(){return "throw "+this.exp.nb()+";";

};
ph_throw.prototype.val=function(){return "__oni_rt.Scall("+this.line+",__oni_rt.Throw,"+this.exp.v()+","+this.line+",'"+this.file+"')";



};



function ph_return(exp,pctx){this.line=pctx.line;

this.exp=exp;

this.nb_ctx=pctx.nb_ctx;
this.is_nblock=pctx.allow_nblock&&(exp?exp.is_nblock:true);
}
ph_return.prototype=new ph();
ph_return.prototype.nblock_val=function(){var rv;

if(this.nb_ctx){

rv="return";
if(this.exp)rv+=" "+this.exp.nb()+";";
}else{


rv="return __oni_rt.CFE('r'";
if(this.exp)rv+=","+this.exp.nb();
rv+=");";
}
return rv;
};
ph_return.prototype.val=function(){var v=this.exp?","+this.exp.v():"";

return "__oni_rt.Scall("+this.line+",__oni_rt.Return"+v+")";
};


function ph_collapse(pctx){this.line=pctx.line;

}
ph_collapse.prototype=new ph();
ph_collapse.prototype.val=function(){return "__oni_rt.Collapse("+this.line+")";

};




function ph_cfe(f,lbl){this.f=f;

this.lbl=lbl;
}
ph_cfe.prototype=new ph();
ph_cfe.prototype.val=function(){var l=this.lbl?'"'+this.lbl+'"':"";

var rv='__oni_rt.Cfe("'+this.f+'"';
if(this.lbl)rv+=',"'+this.lbl+'"';

return rv+")";
};


function gen_for(init_exp,decls,test_exp,inc_exp,body,pctx){var rv;

if(init_exp||decls){
if(decls)rv=gen_var_compound(decls,pctx);else rv=new ph_compound_stmt(pctx);



if(init_exp)rv.stmts.push(init_exp);

rv.stmts.push(new ph_loop(0,test_exp,body,inc_exp));

rv=rv.toBlock();
}else rv=new ph_loop(0,test_exp,body,inc_exp);


return rv;
}




function ph_loop(init_state,test_exp,body,inc_exp){this.init_state=init_state;

this.test_exp=test_exp;
this.inc_exp=inc_exp;
this.body=body;
}
ph_loop.prototype=new ph();
ph_loop.prototype.nblock_val=function(){if(this.init_state==2)throw "Can't encode do-while loops as __js yet";

if(this.test_exp&&this.inc_exp){
return "for(;"+this.test_exp.nb()+";"+this.inc_exp.nb()+"){"+this.body.nb()+"}";

}else if(this.test_exp){

return "while("+this.test_exp.nb()+"){"+this.body.nb()+"}";
}else throw "Can't encode this loop as __js yet";

};
ph_loop.prototype.val=function(){var test=this.test_exp?this.test_exp.v():"1";


var body=this.body?this.body.v(true):"0";
return "__oni_rt.Loop("+this.init_state+","+test+","+(this.inc_exp?this.inc_exp.v():"0")+","+body+")";

};



function gen_for_in(lhs_exp,decl,obj_exp,body,pctx){var rv;

if(decl){
rv=gen_var_compound([decl],pctx);
rv.stmts.push(new ph_for_in(new ph_identifier(decl[0],pctx),obj_exp,body,pctx));


rv=rv.toBlock();
}else rv=new ph_for_in(lhs_exp,obj_exp,body,pctx);


return rv;
}

function ph_for_in(lhs,obj,body,pctx){this.lhs=lhs;

this.obj=obj;
this.body=body;
this.pctx=pctx;
}
ph_for_in.prototype=new ph();
ph_for_in.prototype.val=function(){var rv="__oni_rt.ForIn("+this.obj.v();

rv+=",function(__oni_env, _oniY) { return __oni_rt.ex(__oni_rt.Seq("+0+",";

rv+=(new ph_assign_op(this.lhs,"=",new ph_identifier("_oniY",this.pctx),this.pctx)).v();


if(this.body)rv+=","+this.body.v();

return rv+"), __oni_env)})";
};

function ph_with(exp,body,pctx){this.exp=exp;

this.body=body;
this.line=this.exp.line;
this.file=pctx.fn;
this.is_nblock=pctx.allow_nblock&&exp.is_nblock&&body.is_nblock;
}
ph_with.prototype=new ph();
ph_with.prototype.nblock_val=function(){return "with("+this.exp.nb()+")"+this.body.nb()};
ph_with.prototype.val=function(){var rv="__oni_rt.Sc("+this.line+",__oni_rt.With,"+this.exp.v()+",__oni_rt.Lit(function(__oni_env,__oni_z){with(__oni_z) return __oni_rt.ex("+this.body.v()+",__oni_env)}))";






return rv;
};





function ph_literal(value,pctx,type){this.value=value;

if(type=="<regex>")this.esc_lit=true;

}
ph_literal.prototype=new ph();
ph_literal.prototype.is_nblock=true;

ph_literal.prototype.v=function(){if(this.esc_lit)return "__oni_rt.Lit("+this.value+")";


return this.value;
};
ph_literal.prototype.nblock_val=function(){return this.value};
ph_literal.prototype.destruct=function(){if(this.value!="")throw "invalid pattern";return ""};

function ph_infix_op(left,id,right,pctx){this.left=left;


this.id=id;
this.right=right;
this.line=pctx.line;
this.is_nblock=pctx.allow_nblock&&left.is_nblock&&right.is_nblock;
}
ph_infix_op.prototype=new ph();
ph_infix_op.prototype.is_value=true;
ph_infix_op.prototype.nblock_val=function(){return this.left.nb()+" "+this.id+" "+this.right.nb();

};
ph_infix_op.prototype.val=function(){if(this.is_nblock){



return nblock_val_to_val(this.nb(),true,this.line);
}else if(this.id=="||"){


return "__oni_rt.Seq("+2+","+this.left.v()+","+this.right.v()+")";
}else if(this.id=="&&"){


return "__oni_rt.Seq("+4+","+this.left.v()+","+this.right.v()+")";
}else return "__oni_rt.Scall("+this.line+",__oni_rt.infix['"+this.id+"'],"+this.left.v()+","+this.right.v()+")";


};

function ph_assign_op(left,id,right,pctx){if(!left.is_ref&&!left.is_id){


this.dest=true;
if(id!="=")throw "Invalid operator in destructuring assignment";
}
this.left=left;
this.id=id;
this.right=right;
this.line=pctx.line;
this.is_nblock=pctx.allow_nblock&&left.is_nblock&&right.is_nblock&&!this.dest;

}
ph_assign_op.prototype=new ph();
ph_assign_op.prototype.is_value=true;
ph_assign_op.prototype.nblock_val=function(){return this.left.nb()+this.id+this.right.nb();

};
ph_assign_op.prototype.val=function(){var rv;

if(this.is_nblock){
rv=nblock_val_to_val(this.nb(),true,this.line);
}else if(this.dest){

rv="__oni_rt.Scall("+this.line+",function(_oniX";
try{
var drefs=[],body=this.left.destruct("_oniX",drefs);
for(var i=1;i<=drefs.length;++i)rv+=",_oniX"+i;

rv+="){"+body+"},"+this.right.v();
for(var i=0;i<drefs.length;++i)rv+=","+drefs[i];

rv+=")";
}catch(e){

throw {mes:"Invalid left side in destructuring assignment ",line:this.line};

}
}else if(!this.left.is_ref||this.left.is_nblock){





rv="__oni_rt.Scall("+this.line+",function(_oniX){return "+this.left.nb()+this.id+"_oniX;},"+this.right.v()+")";


}else{


rv="__oni_rt.Scall("+this.line+",function(l, r){return l[0][l[1]]"+this.id+"r;},"+this.left.ref()+","+this.right.v()+")";

}
return rv;
};

function ph_prefix_op(id,right,pctx){this.id=id;

this.right=right;
this.line=pctx.line;
this.is_nblock=(pctx.allow_nblock&&right.is_nblock)&&id!="spawn";
}
ph_prefix_op.prototype=new ph();
ph_prefix_op.prototype.is_value=true;
ph_prefix_op.prototype.nblock_val=function(){return this.id+" "+this.right.nb();

};
ph_prefix_op.prototype.val=function(){var rv;

if(this.id=="spawn")rv="__oni_rt.Spawn("+this.line+","+this.right.v()+")";else if(this.right.is_nblock){





rv=nblock_val_to_val(this.nb(),true,this.line);
}else if(this.right.is_ref){
rv="__oni_rt.Scall("+this.line+",function(r){return "+this.id+" r[0][r[1]]},"+this.right.ref()+")";

}else{


rv="__oni_rt.Scall("+this.line+",function(r){return "+this.id+" r},"+this.right.v()+")";

}
return rv;
};

function ph_postfix_op(left,id,pctx){if(!left.is_ref&&!left.is_id)throw "Invalid argument for postfix op '"+id+"'";

this.left=left;
this.id=id;
this.line=pctx.line;
this.is_nblock=pctx.allow_nblock&&left.is_nblock;
}
ph_postfix_op.prototype=new ph();
ph_postfix_op.prototype.is_value=true;
ph_postfix_op.prototype.nblock_val=function(){return this.left.nb()+this.id+" "};
ph_postfix_op.prototype.val=function(){var rv;

if(this.left.is_nblock){

rv=nblock_val_to_val(this.nb(),true,this.line);
}else if(this.left.is_ref){

rv="__oni_rt.Scall("+this.line+",function(l){return l[0][l[1]]"+this.id+"},"+this.left.ref()+")";

}
return rv;
};

function gen_identifier(value,pctx){if(value=="hold"){




var rv=new ph_literal('__oni_rt.Hold',pctx);
rv.esc_lit=true;
rv.is_id=true;
return rv;
}


return new ph_identifier(value,pctx);
}
function ph_identifier(value,pctx){this.value=value;

this.line=pctx.line;
}
ph_identifier.prototype=new ph();
ph_identifier.prototype.is_nblock=true;
ph_identifier.prototype.is_id=true;
ph_identifier.prototype.is_value=true;
ph_identifier.prototype.nblock_val=function(){return this.value};
ph_identifier.prototype.val=function(){return nblock_val_to_val(this.value,true,this.line)};
ph_identifier.prototype.destruct=function(dpath){return this.value+"="+dpath+";";

};






function is_nblock_arr(arr){for(var i=0;i<arr.length;++i)if(!arr[i].is_nblock)return false;


return true;
}

function ph_fun_call(l,args,pctx){this.l=l;

this.args=args;
this.nblock_form=l.is_nblock&&is_nblock_arr(args);
this.line=pctx.line;
}
ph_fun_call.prototype=new ph();
ph_fun_call.prototype.is_value=true;
ph_fun_call.prototype.nblock_val=function(){var rv=this.l.nb()+"(";



for(var i=0;i<this.args.length;++i){
if(i)rv+=",";
rv+=this.args[i].nb();
}
return rv+")";
};
ph_fun_call.prototype.val=function(){var rv;

if(this.nblock_form){
rv=this.l.nb()+"(";
for(var i=0;i<this.args.length;++i){
if(i)rv+=",";
rv+=this.args[i].nb();
}
return nblock_val_to_val(rv+")",true,this.line);
}else if(this.l.is_ref){

rv="__oni_rt.Fcall(1,"+this.line+","+this.l.ref();
}else{



rv="__oni_rt.Fcall(0,"+this.line+","+this.l.v();
}
for(var i=0;i<this.args.length;++i){
rv+=","+this.args[i].v();
}
rv+=")";
return rv;
};

function ph_dot_accessor(l,name,pctx){this.l=l;

this.name=name;
this.line=pctx.line;
this.is_nblock=pctx.allow_nblock&&l.is_nblock;
}
ph_dot_accessor.prototype=new ph();
ph_dot_accessor.prototype.is_ref=true;
ph_dot_accessor.prototype.is_value=true;
ph_dot_accessor.prototype.nblock_val=function(){return this.l.nb()+"."+this.name};
ph_dot_accessor.prototype.val=function(){return "__oni_rt.Scall("+this.line+",function(l){return l."+this.name+";},"+this.l.v()+")";


};
ph_dot_accessor.prototype.ref=function(){return "__oni_rt.Scall("+this.line+",function(l){return [l,'"+this.name+"'];},"+this.l.v()+")";



};
ph_dot_accessor.prototype.destruct=function(dpath,drefs){drefs.push(this.ref());

var v="_oniX"+drefs.length;
return v+"[0]["+v+"[1]]="+dpath+";";
};

function ph_idx_accessor(l,idxexp,pctx){this.l=l;

this.idxexp=idxexp;
this.line=pctx.line;

this.is_nblock=pctx.allow_nblock&&l.is_nblock&&idxexp.is_nblock;
}
ph_idx_accessor.prototype=new ph();
ph_idx_accessor.prototype.is_ref=true;
ph_idx_accessor.prototype.is_value=true;
ph_idx_accessor.prototype.nblock_val=function(){return this.l.nb()+"["+this.idxexp.nb()+"]";

};
ph_idx_accessor.prototype.val=function(){return "__oni_rt.Scall("+this.line+",function(l, idx){return l[idx];},"+this.l.v()+","+this.idxexp.v()+")";


};
ph_idx_accessor.prototype.ref=function(){if(this.is_nblock)return "(function(arguments){return ["+this.l.nb()+","+this.idxexp.nb()+"]})";else return "__oni_rt.Scall("+this.line+",function(l, idx){return [l, idx];},"+this.l.v()+","+this.idxexp.v()+")";






};


function ph_group(e,pctx){this.e=e;

this.is_nblock=pctx.allow_nblock&&e.is_nblock;
}
ph_group.prototype=new ph();
ph_group.prototype.is_value=true;
ph_group.prototype.nblock_val=function(){return "("+this.e.nb()+")"};
ph_group.prototype.val=function(){return this.e.v()};
ph_group.prototype.destruct=function(dpath,drefs){return this.e.destruct(dpath,drefs)};

function ph_arr_lit(elements,pctx){this.elements=elements;

this.line=pctx.line;
this.is_nblock=pctx.allow_nblock&&is_nblock_arr(elements);

}
ph_arr_lit.prototype=new ph();
ph_arr_lit.prototype.is_value=true;
ph_arr_lit.prototype.nblock_val=function(){var rv="[";

for(var i=0;i<this.elements.length;++i){
if(i)rv+=",";
rv+=this.elements[i].nb();
}
return rv+"]";
};
ph_arr_lit.prototype.val=function(){var rv="__oni_rt.Scall("+this.line+",__oni_rt.Arr";

for(var i=0;i<this.elements.length;++i){
rv+=","+this.elements[i].v();
}
return rv+")";
};
ph_arr_lit.prototype.destruct=function(dpath,drefs){var rv="";

for(var i=0;i<this.elements.length;++i){
rv+=this.elements[i].destruct(dpath+"["+i+"]",drefs);
}
return rv;
};


function ph_obj_lit(props,pctx){this.props=props;

this.line=pctx.line;
this.is_nblock=pctx.allow_nblock&&(function(){for(var i=0;i<props.length;++i){


if(!props[i][2].is_nblock)return false;
}
return true;
})();


}
ph_obj_lit.prototype=new ph();
ph_obj_lit.prototype.is_value=true;
ph_obj_lit.prototype.nblock_val=function(){var rv="{";

for(var i=0;i<this.props.length;++i){
if(i!=0)rv+=",";



rv+=this.props[i][1]+":"+this.props[i][2].nb();
}
return rv+"}";
};

function quotedName(name){if(name.charAt(0)=="'"||name.charAt(0)=='"')return name;


return '"'+name+'"';
}

ph_obj_lit.prototype.val=function(){var rv="__oni_rt.Scall("+this.line+",__oni_rt.Obj, [";




for(var i=0;i<this.props.length;++i){
if(i)rv+=",";
if(this.props[i][0]=="pat")throw {mes:"Missing initializer for object property "+quotedName(this.props[i][1]),line:this.props[i][2]};


rv+=quotedName(this.props[i][1]);
}
rv+="]";
for(var i=0;i<this.props.length;++i){
rv+=","+this.props[i][2].v();
}
return rv+")";
};
ph_obj_lit.prototype.destruct=function(dpath,drefs){var rv="";

for(var i=0;i<this.props.length;++i){
var p=this.props[i];
if(p[0]=="pat"){
if(p[1].charAt(0)=="'"||p[1].charAt(0)=='"'){




throw "invalid syntax";
}
rv+=p[1]+"="+dpath+"."+p[1]+";";
}else rv+=p[2].destruct(dpath+"["+quotedName(p[1])+"]",drefs);


}
return rv;
};


function ph_conditional(t,c,a,pctx){this.t=t;

this.c=c;
this.a=a;
this.line=t.line;
this.is_nblock=pctx.allow_nblock&&t.is_nblock&&c.is_nblock&&a.is_nblock;
}
ph_conditional.prototype=new ph();
ph_conditional.prototype.is_value=true;
ph_conditional.prototype.nblock_val=function(){return this.t.nb()+"?"+this.c.nb()+":"+this.a.nb();

};
ph_conditional.prototype.val=function(){return "__oni_rt.If("+this.t.v()+","+this.c.v()+","+this.a.v()+")";

};

function ph_new(exp,args){this.exp=exp;

this.args=args;
this.line=exp.line;
}
ph_new.prototype=new ph();
ph_new.prototype.is_value=true;
ph_new.prototype.nblock_val=function(){var rv="new "+this.exp.nb()+"(";


for(var i=0;i<this.args.length;++i){
if(i)rv+=",";
rv+=this.args[i].nb();
}
return rv+")";
};

ph_new.prototype.val=function(){var rv="__oni_rt.Fcall(2,"+this.line+","+this.exp.v();

for(var i=0;i<this.args.length;++i){
rv+=","+this.args[i].v();
}
rv+=")";
return rv;
};









function gen_waitfor_andor(op,blocks,crf,pctx){if(crf[0]||crf[1]||crf[2])return new ph_try(new ph_par_alt(op,blocks),crf,pctx);else return new ph_par_alt(op,blocks);




}

function ph_par_alt(op,blocks){this.op=op;

this.blocks=blocks;
}
ph_par_alt.prototype=new ph();
ph_par_alt.prototype.is_nblock=false;
ph_par_alt.prototype.val=function(){var rv="__oni_rt.";

if(this.op=="and")rv+="Par(";else rv+="Alt(";



for(var i=0;i<this.blocks.length;++i){
var b=this.blocks[i].v();
if(!b.length)b="0";
if(i)rv+=",";
rv+=b;
}
return rv+")";
};

function gen_suspend(has_var,decls,block,crf,pctx){var rv;

if(has_var){
rv=gen_var_compound(decls,pctx);
rv.stmts.push(gen_suspend_inner(decls,block,crf,pctx));

rv=rv.toBlock();
}else rv=gen_suspend_inner(decls,block,crf,pctx);


return rv;
}

function gen_suspend_inner(decls,block,crf,pctx){var wrapped=(crf[0]||crf[1]||crf[2]);


var rv=new ph_suspend(decls,block,wrapped,pctx);
if(wrapped)rv=new ph_suspend_wrapper((new ph_try(rv,crf,pctx)).v(),pctx);

return rv;
}

function ph_suspend(decls,block,wrapped,pctx){this.decls=decls;

this.block=block;
this.wrapped=wrapped;
this.file=pctx.fn;
}
ph_suspend.prototype=new ph();
ph_suspend.prototype.val=function(){var rv="__oni_rt.Suspend(function(__oni_env,";

if(this.wrapped)rv+="_oniX){resume=_oniX;";else rv+="resume){";



var b=this.block.v();
if(b.length)rv+="return __oni_rt.ex("+b+",__oni_env)";

rv+="}, function() {";
for(var i=0;i<this.decls.length;++i){
var name=this.decls[i][0];
if(name=="arguments")throw "Cannot use 'arguments' as variable name in waitfor()";
rv+=name+"=arguments["+i+"];";
}
rv+="})";
return rv;
};


function ph_suspend_wrapper(code,pctx){this.code=code;

this.line=pctx.line;
this.file=pctx.fn;
}
ph_suspend_wrapper.prototype=new ph();
ph_suspend_wrapper.prototype.val=function(){return "function(arguments, __oni_env){var resume;"+"return __oni_rt.ex("+this.code+",__oni_env)}";



};



function gen_using(has_var,lhs,exp,body,pctx){var rv;

if(has_var){

if(!lhs.is_id)throw "Variable name expected in 'using' expression";
rv=gen_var_compound([[lhs.nb()]],pctx);
rv.stmts.push(new ph_using(lhs,exp,body,pctx));
rv=rv.toBlock();
}else rv=new ph_using(lhs,exp,body,pctx);


return rv;
}

function ph_using(lhs,exp,body,pctx){this.body=body||new ph_literal(0,pctx);


this.assign1=new ph_assign_op(new ph_identifier("_oniW",pctx),"=",exp,pctx);

if(lhs)this.assign2=new ph_assign_op(lhs,"=",new ph_identifier("_oniW",pctx),pctx);


}

ph_using.prototype=new ph();
ph_using.prototype.val=function(){var rv="function(arguments, __oni_env){var _oniW;"+"return __oni_rt.ex(__oni_rt.Seq("+0+","+this.assign1.v()+",";




if(this.assign2)rv+=this.assign2.v()+",";

rv+="__oni_rt.Try("+0+","+this.body.v()+",0,"+"function(){if(_oniW&&_oniW.__finally__)return _oniW.__finally__()},0)),__oni_env)}";

return rv;
};












function Hash(){}
Hash.prototype={lookup:function(key){
return this["$"+key]},put:function(key,val){
this["$"+key]=val},del:function(key){
delete this["$"+key]}};






















var TOKENIZER_SA=/(?:[ \f\r\t\v\u00A0\u2028\u2029]+|\/\/.*|#!.*)*(?:((?:\n|\/\*(?:.|\n|\r)*?\*\/)+)|((?:0[xX][\da-fA-F]+)|(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?))|(\/(?:\\.|\[(?:\\.|[^\n\]])*\]|[^\/\n])+\/[gimy]*)|(==|!=|>>|<<|<=|>=|--|\+\+|\|\||&&|[-*\/%+&^|]=|[;,?:|^&=<>+\-*\/%!~.\[\]{}()]|[$_\w]+)|('(?:\\.|[^\'\n])*'|"(?:\\.|[^\"\n])*")|('(?:\\.|[^\'])*'|"(?:\\.|[^\"])*")|(\S+))/g;



var TOKENIZER_OP=/(?:[ \f\r\t\v\u00A0\u2028\u2029]+|\/\/.*|#!.*)*(?:((?:\n|\/\*(?:.|\n|\r)*?\*\/)+)|(>>>=|===|!==|>>>|<<=|>>=|==|!=|>>|<<|<=|>=|--|\+\+|\|\||&&|[-*\/%+&^|]=|[;,?:|^&=<>+\-*\/%!~.\[\]{}()]|[$_\w]+))/g;





function SemanticToken(){}
SemanticToken.prototype={exsf:function(pctx,st){




throw "Unexpected "+this},excbp:0,excf:function(left,pctx,st){




throw "Unexpected "+this},stmtf:null,tokenizer:TOKENIZER_SA,toString:function(){









return "'"+this.id+"'"},exs:function(f){




this.exsf=f;

return this;
},exc:function(bp,f){
this.excbp=bp;

if(f)this.excf=f;
return this;
},stmt:function(f){
this.stmtf=f;

return this;
},ifx:function(bp,right_assoc){


this.excbp=bp;

if(right_assoc)bp-=.5;
this.excf=function(left,pctx,st){var right=parseExp(pctx,bp,st);

return new ph_infix_op(left,this.id,right,pctx);
};
return this;
},asg:function(bp,right_assoc){

this.excbp=bp;

if(right_assoc)bp-=.5;
this.excf=function(left,pctx,st){var right=parseExp(pctx,bp,st);

return new ph_assign_op(left,this.id,right,pctx);
};
return this;
},pre:function(bp){

return this.exs(function(pctx,st){
var right=parseExp(pctx,bp,st);

return new ph_prefix_op(this.id,right,pctx);
});
},pst:function(bp){

return this.exc(bp,function(left,pctx,st){
return new ph_postfix_op(left,this.id,pctx);

});
}};



function Literal(type,value){this.id=type;

this.value=value;
}
Literal.prototype=new SemanticToken();
Literal.prototype.tokenizer=TOKENIZER_OP;
Literal.prototype.toString=function(){return "literal '"+this.value+"'"};
Literal.prototype.exsf=function(pctx,st){return new ph_literal(this.value,pctx,this.id);

};


function Identifier(value){this.value=value;

}
Identifier.prototype=new Literal("<id>");
Identifier.prototype.exsf=function(pctx,st){return gen_identifier(this.value,pctx);

};
Identifier.prototype.toString=function(){return "identifier '"+this.value+"'"};



var ST=new Hash();
function S(id,tokenizer){var t=new SemanticToken();

t.id=id;
if(tokenizer)t.tokenizer=tokenizer;

ST.put(id,t);
return t;
}




S("[").exs(function(pctx,st){

var elements=[];

while(pctx.token.id!="]"){
if(elements.length)scan(pctx,",");
if(pctx.token.id==","){
elements.push((function(pctx){return new ph_literal("",pctx)})(pctx));
}else if(pctx.token.id=="]")break;else elements.push(parseExp(pctx,110));




}
scan(pctx,"]");
return new ph_arr_lit(elements,pctx);
}).exc(270,function(l,pctx,st){

var idxexp=parseExp(pctx);

scan(pctx,"]");

return new ph_idx_accessor(l,idxexp,pctx);
});

S(".").exc(270,function(l,pctx,st){if(pctx.token.id!="<id>")throw "Expected an identifier, found '"+pctx.token+"' instead";


var name=pctx.token.value;
scan(pctx);
return new ph_dot_accessor(l,name,pctx);
});

S("new").exs(function(pctx,st){var exp=parseExp(pctx,0,"(");

var args=[];
if(pctx.token.id=="("){
scan(pctx);
while(pctx.token.id!=")"){
if(args.length)scan(pctx,",");
args.push(parseExp(pctx,110));
}
scan(pctx,")");
}
return new ph_new(exp,args);
});

S("(").exs(function(pctx,st){

var e=parseExp(pctx);

scan(pctx,")");
return new ph_group(e,pctx);
}).exc(260,function(l,pctx,st){

var args=[];

while(pctx.token.id!=")"){
if(args.length)scan(pctx,",");
args.push(parseExp(pctx,110));
}
scan(pctx,")");
return new ph_fun_call(l,args,pctx);
});

S("++").pre(240).pst(250).asi_restricted=true;
S("--").pre(240).pst(250).asi_restricted=true;

S("delete").pre(240);
S("void").pre(240);
S("typeof").pre(240);
S("+").pre(240).ifx(220);
S("-").pre(240).ifx(220);
S("~").pre(240);
S("!").pre(240);

S("*").ifx(230);
S("/").ifx(230);
S("%").ifx(230);



S("<<").ifx(210);
S(">>").ifx(210);
S(">>>").ifx(210);

S("<").ifx(200);
S(">").ifx(200);
S("<=").ifx(200);
S(">=").ifx(200);
S("instanceof").ifx(200);

S("in").ifx(200);

S("==").ifx(190);
S("!=").ifx(190);
S("===").ifx(190);
S("!==").ifx(190);

S("&").ifx(180);
S("^").ifx(170);
S("|").ifx(160);
S("&&").ifx(150);
S("||").ifx(140);

S("?").exc(130,function(test,pctx,st){var consequent=parseExp(pctx,110);

scan(pctx,":");
var alternative=parseExp(pctx,110);
return new ph_conditional(test,consequent,alternative,pctx);
});

S("=").asg(120,true);
S("*=").asg(120,true);
S("/=").asg(120,true);
S("%=").asg(120,true);
S("+=").asg(120,true);
S("-=").asg(120,true);
S("<<=").asg(120,true);
S(">>=").asg(120,true);
S(">>>=").asg(120,true);
S("&=").asg(120,true);
S("^=").asg(120,true);
S("|=").asg(120,true);

S("spawn").pre(115);

S(",").ifx(110,true);


function validatePropertyName(token){var id=token.id;

if(id!="<id>"&&id!="<string>"&&id!="<number>")throw "Invalid object literal syntax; property name expected, but saw "+token;

}

function parseBlock(pctx){push_stmt_scope(pctx);

while(pctx.token.id!="}"){
var stmt=parseStmt(pctx);
add_stmt(stmt,pctx);
}
scan(pctx,"}");
return pop_block(pctx);
}

S("{").exs(function(pctx,st){

var props=[];

while(pctx.token.id!="}"){
if(props.length)scan(pctx,",");
var prop=pctx.token;
if(prop.id=="}")break;

validatePropertyName(prop);
scan(pctx);
if(pctx.token.id==":"){

scan(pctx);
var exp=parseExp(pctx,110);
props.push(["prop",prop.value,exp]);
}else if(pctx.token.id=="}"||pctx.token.id==","){

props.push(["pat",prop.value,pctx.line]);
}else throw "Unexpected token '"+pctx.token+"'";


}
scan(pctx,"}",TOKENIZER_OP);
return new ph_obj_lit(props,pctx);
}).stmt(parseBlock);




S(";").stmt(function(pctx){return undefined});
S(")",TOKENIZER_OP);
S("]",TOKENIZER_OP);
S("}");
S(":");

S("<eof>").exs(function(pctx,st){
throw "Unexpected end of input (exs)"}).stmt(function(pctx){
throw "Unexpected end of input (stmt)"});




function parseFunctionBody(pctx){push_decl_scope(pctx);
push_stmt_scope(pctx);
scan(pctx,"{");
while(pctx.token.id!="}"){
var stmt=parseStmt(pctx);
add_stmt(stmt,pctx);
}
scan(pctx,"}");
return pop_decl_scope(pctx)+pop_stmt_scope(pctx,"return __oni_rt.exseq(arguments,this,'"+pctx.fn+"',["+1,"])");
}



function parseFunctionInner(pctx,pars){var par=scan(pctx,"(");

while(pctx.token.id!=")"){
if(pars.length)par=scan(pctx,",");

if(par.id!="<id>")throw "Expected parameter name; found '"+par+"'";

scan(pctx);
pars.push(par.value);
}
scan(pctx,")");
return parseFunctionBody(pctx);
}

S("function").exs(function(pctx,st){

var fname="";

if(pctx.token.id=="<id>"){
fname=pctx.token.value;
scan(pctx);
}
var pars=[];
var body=parseFunctionInner(pctx,pars);
return new ph_fun_exp(fname,pars,body,pctx);
}).stmt(function(pctx){

if(pctx.token.id!="<id>")throw "Malformed function declaration";

var fname=pctx.token.value;
scan(pctx);
var pars=[];
var body=parseFunctionInner(pctx,pars);
return gen_fun_decl(fname,pars,body,pctx);
});

S("this",TOKENIZER_OP).exs(function(pctx,st){return new ph_identifier('this',pctx)});
S("true",TOKENIZER_OP).exs(function(pctx,st){return new ph_literal('true',pctx)});
S("false",TOKENIZER_OP).exs(function(pctx,st){return new ph_literal('false',pctx)});
S("null",TOKENIZER_OP).exs(function(pctx,st){return new ph_literal('null',pctx)});

S("collapse",TOKENIZER_OP).exs(function(pctx,st){return new ph_collapse(pctx)});

function isStmtTermination(token){return token.id==";"||token.id=="}"||token.id=="<eof>";

}

function parseStmtTermination(pctx){if(pctx.token.id!="}"&&pctx.token.id!="<eof>"&&!pctx.newline)scan(pctx,";");


}

function parseVarDecls(pctx,st){var decls=[];

do {
if(decls.length)scan(pctx,",");
var id=pctx.token.value;
scan(pctx,"<id>");
if(pctx.token.id=="="){
scan(pctx);
var initialiser=parseExp(pctx,110,st);
decls.push([id,initialiser]);
}else decls.push([id]);


}while(pctx.token.id==",");
return decls;
}

S("var").stmt(function(pctx){var decls=parseVarDecls(pctx);

parseStmtTermination(pctx);
return gen_var_decl(decls,pctx);
});

S("else");

S("if").stmt(function(pctx){scan(pctx,"(");

var test=parseExp(pctx);
scan(pctx,")");
var consequent=parseStmt(pctx);
var alternative=null;
if(pctx.token.id=="else"){
scan(pctx);
alternative=parseStmt(pctx);
}
return new ph_if(test,consequent,alternative,pctx);
});

S("while").stmt(function(pctx){scan(pctx,"(");

var test=parseExp(pctx);
scan(pctx,")");
var body=parseStmt(pctx);
return new ph_loop(0,test,body);
});

S("do").stmt(function(pctx){var body=parseStmt(pctx);

scan(pctx,"while");
scan(pctx,"(");
var test=parseExp(pctx);
scan(pctx,")");
parseStmtTermination(pctx);
return new ph_loop(2,test,body);
});

S("for").stmt(function(pctx){scan(pctx,"(");

var start_exp=null;
var decls=null;
if(pctx.token.id=="var"){
scan(pctx);
decls=parseVarDecls(pctx,"in");
}else{

if(pctx.token.id!=";")start_exp=parseExp(pctx,0,"in");

}

if(pctx.token.id==";"){
scan(pctx);
var test_exp=null;
if(pctx.token.id!=";")test_exp=parseExp(pctx);

scan(pctx,";");
var inc_exp=null;
if(pctx.token.id!=")")inc_exp=parseExp(pctx);

scan(pctx,")");
var body=parseStmt(pctx);
return gen_for(start_exp,decls,test_exp,inc_exp,body,pctx);
}else if(pctx.token.id=="in"){

scan(pctx);

if(decls&&decls.length>1)throw "More that one variable declaration in for-in loop";

var obj_exp=parseExp(pctx);
scan(pctx,")");
var body=parseStmt(pctx);
var decl=decls?decls[0]:null;
return gen_for_in(start_exp,decl,obj_exp,body,pctx);
}else throw "Unexpected token '"+pctx.token+"' in for-statement";


});

S("continue").stmt(function(pctx){var label=null;

if(pctx.token.id=="<id>"&&!pctx.newline){
label=pctx.token.value;
scan(pctx);
}
parseStmtTermination(pctx);
return new ph_cfe("c",label);
});

S("break").stmt(function(pctx){var label=null;

if(pctx.token.id=="<id>"&&!pctx.newline){
label=pctx.token.value;
scan(pctx);
}
parseStmtTermination(pctx);
return new ph_cfe("b",label);
});

S("return").stmt(function(pctx){var exp=null;

if(!isStmtTermination(pctx.token)&&!pctx.newline)exp=parseExp(pctx);

parseStmtTermination(pctx);
return new ph_return(exp,pctx);
});

S("with").stmt(function(pctx){scan(pctx,"(");

var exp=parseExp(pctx);
scan(pctx,")");
var body=parseStmt(pctx);
return new ph_with(exp,body,pctx);
});

S("case");
S("default");

S("switch").stmt(function(pctx){scan(pctx,"(");

var exp=parseExp(pctx);
scan(pctx,")");
scan(pctx,"{");
var clauses=[];
while(pctx.token.id!="}"){
var clause_exp=null;
if(pctx.token.id=="case"){
scan(pctx);
clause_exp=parseExp(pctx);
}else if(pctx.token.id=="default"){

scan(pctx);
}else throw "Invalid token '"+pctx.token+"' in switch statement";


scan(pctx,":");
push_stmt_scope(pctx);top_stmt_scope(pctx).exp=clause_exp;
while(pctx.token.id!="case"&&pctx.token.id!="default"&&pctx.token.id!="}"){
var stmt=parseStmt(pctx);
add_stmt(stmt,pctx);
}
clauses.push((function(pctx){var cexp=top_stmt_scope(pctx).exp;var block=pop_block(pctx);return "["+(cexp?cexp.v():"__oni_rt.Default")+","+block.v()+"]"})(pctx));
}
scan(pctx,"}");
return new ph_switch(exp,clauses);(exp,clauses,pctx);
});

S("throw").stmt(function(pctx){if(pctx.newline)throw "Illegal newline after throw";

var exp=parseExp(pctx);
parseStmtTermination(pctx);
return new ph_throw(exp,pctx);;
});

S("catch");
S("finally");





function parseCRF(pctx){var rv=[];

var a=null;
if(pctx.token.id=="catch"||pctx.token.value=="catchall"){



var all=pctx.token.value=="catchall";
a=[];
scan(pctx);
a.push(scan(pctx,"(").value);
scan(pctx,"<id>");
scan(pctx,")");
scan(pctx,"{");
a.push(parseBlock(pctx));
a.push(all);
}
rv.push(a);
if(pctx.token.value=="retract"){
scan(pctx);
scan(pctx,"{");
rv.push(parseBlock(pctx));
}else rv.push(null);


if(pctx.token.id=="finally"){
scan(pctx);
scan(pctx,"{");
rv.push(parseBlock(pctx));
}else rv.push(null);


return rv;
}

S("try").stmt(function(pctx){scan(pctx,"{");

var block=parseBlock(pctx);
var op=pctx.token.value;
if(op!="and"&&op!="or"){

var crf=parseCRF(pctx);
if(!crf[0]&&!crf[1]&&!crf[2])throw "Missing 'catch', 'finally' or 'retract' after 'try'";

return new ph_try(block,crf,pctx);
}else{

var blocks=[block];
do {
scan(pctx);
scan(pctx,"{");
blocks.push(parseBlock(pctx));
}while(pctx.token.value==op);
var crf=parseCRF(pctx);
return gen_waitfor_andor(op,blocks,crf,pctx);
}
});

S("waitfor").stmt(function(pctx){if(pctx.token.id=="{"){


scan(pctx,"{");
var blocks=[parseBlock(pctx)];
var op=pctx.token.value;
if(op!="and"&&op!="or")throw "Missing 'and' or 'or' after 'waitfor' block";
do {
scan(pctx);
scan(pctx,"{");
blocks.push(parseBlock(pctx));
}while(pctx.token.value==op);
var crf=parseCRF(pctx);
return gen_waitfor_andor(op,blocks,crf,pctx);
}else{


scan(pctx,"(");
var has_var=(pctx.token.id=="var");
if(has_var)scan(pctx);
var decls=[];
if(pctx.token.id==")"){
if(has_var)throw "Missing variables in waitfor(var)";
}else decls=parseVarDecls(pctx);


scan(pctx,")");
scan(pctx,"{");
++top_decl_scope(pctx).fscoped_ctx;
var block=parseBlock(pctx);
var crf=parseCRF(pctx);
--top_decl_scope(pctx).fscoped_ctx;
return gen_suspend(has_var,decls,block,crf,pctx);
}
});


S("using").stmt(function(pctx){var has_var;

scan(pctx,"(");
if(has_var=(pctx.token.id=="var"))scan(pctx);

var lhs,exp;
var e1=parseExp(pctx,120);
if(pctx.token.id=="="){
lhs=e1;
scan(pctx);
exp=parseExp(pctx);
}else{

if(has_var)throw "Syntax error in 'using' expression";

exp=e1;
}
scan(pctx,")");
var body=parseStmt(pctx);
return gen_using(has_var,lhs,exp,body,pctx);
});

S("__js").stmt(function(pctx){if(pctx.allow_nblock)++pctx.nb_ctx;

var body=parseStmt(pctx);
if(pctx.allow_nblock)--pctx.nb_ctx;
body.is_nblock=pctx.allow_nblock;return body;
});



S("abstract");
S("boolean");
S("byte");
S("char");
S("class");
S("const");
S("debugger");
S("double");
S("enum");
S("export");
S("extends");
S("final");
S("float");
S("goto");
S("implements");
S("import");
S("int");
S("interface");
S("long");
S("native");
S("package");
S("private");
S("protected");
S("public");
S("short");
S("static");
S("super");
S("synchronized");
S("throws");
S("transient");
S("volatile");




function makeParserContext(src,settings){var ctx={src:src,line:1,lastIndex:0,token:null};







if(settings)for(var a in settings)ctx[a]=settings[a];



return ctx;
}


function compile(src,settings){var pctx=makeParserContext(src+"\n",settings);









try{
return parseScript(pctx);
}catch(e){

var mes=e.mes||e;
var line=e.line||pctx.line;
throw new Error("SJS syntax error "+(pctx.filename?"in "+pctx.filename+",":"at")+" line "+line+": "+mes);
}
}
exports.compile=compile;

function parseScript(pctx){begin_script(pctx);

scan(pctx);
while(pctx.token.id!="<eof>"){
var stmt=parseStmt(pctx);
add_stmt(stmt,pctx);;
}
return end_script(pctx);
}

function parseStmt(pctx){var t=pctx.token;

scan(pctx);
if(t.stmtf){

return t.stmtf(pctx);
}else if(t.id=="<id>"&&pctx.token.id==":"){


scan(pctx);

var stmt=parseStmt(pctx);
throw "labeled statements not implemented yet";
}else{


var exp=parseExp(pctx,0,null,t);
parseStmtTermination(pctx);
return new ph_exp_stmt(exp,pctx);
}
}


function parseExp(pctx,bp,st,t){bp=bp||0;

if(!t){
t=pctx.token;
scan(pctx);
}
var left=t.exsf(pctx,st);
while(bp<pctx.token.excbp&&pctx.token.id!=st){
t=pctx.token;

if(pctx.newline&&(!t.excf||t.asi_restricted))return left;

scan(pctx);
left=t.excf(left,pctx,st);
}
return left;
}

function scan(pctx,id,tokenizer){if(!tokenizer){

if(pctx.token)tokenizer=pctx.token.tokenizer;else tokenizer=TOKENIZER_SA;



}

if(id&&(!pctx.token||pctx.token.id!=id))throw "Unexpected "+pctx.token;

pctx.token=null;
pctx.newline=0;
while(!pctx.token){
tokenizer.lastIndex=pctx.lastIndex;
var matches=tokenizer.exec(pctx.src);
if(!matches){
pctx.token=ST.lookup("<eof>");
break;
}
pctx.lastIndex=tokenizer.lastIndex;

if(tokenizer==TOKENIZER_SA){
if(matches[4]){
pctx.token=ST.lookup(matches[4]);
if(!pctx.token){
pctx.token=new Identifier(matches[4]);
}
}else if(matches[1]){

var m=matches[1].match(/\n/g);
if(m){
pctx.line+=m.length;
pctx.newline+=m.length;

}

}else if(matches[5])pctx.token=new Literal("<string>",matches[5]);else if(matches[6]){



var val=matches[6];
var m=val.match(/\n/g);
pctx.line+=m.length;
pctx.newline+=m.length;
val=val.replace(/\\\n/g,"").replace(/\n/g,"\\n");
pctx.token=new Literal("<string>",val);
}else if(matches[2])pctx.token=new Literal("<number>",matches[2]);else if(matches[3])pctx.token=new Literal("<regex>",matches[3]);else if(matches[7])throw "Unexpected characters: '"+matches[7]+"'";else throw "Internal scanner error";









}else if(tokenizer==TOKENIZER_OP){

if(matches[2]){
pctx.token=ST.lookup(matches[2]);
if(!pctx.token){
pctx.token=new Identifier(matches[2]);
}
}else if(matches[1]){

var m=matches[1].match(/\n/g);
if(m){
pctx.line+=m.length;
pctx.newline+=m.length;

}

}else{




tokenizer=TOKENIZER_SA;

}

}else throw "Internal scanner error: no tokenizer";


}
return pctx.token;
}


})(__oni_rt.c1={});__oni_rt.modsrc['sjs:apollo-sys-common.sjs']="__oni_rt.sys=exports;\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nexports.hostenv=__oni_rt.hostenv;\n\n\n\n\n\nexports.getGlobal=function(){return __oni_rt.G};\n\n\n\n\n\n\n\nexports.isArrayOrArguments=function(obj){return Array.isArray(obj)||!!(obj&&Object.prototype.hasOwnProperty.call(obj,\'callee\'));\n\n\n};\n\n\n\n\n\n\n\n\n\n\n\nexports.flatten=function(arr,rv){var rv=rv||[];\n\nvar l=arr.length;\nfor(var i=0;i<l;++i){\nvar elem=arr[i];\nif(exports.isArrayOrArguments(elem))exports.flatten(elem,rv);else rv.push(elem);\n\n\n\n}\nreturn rv;\n};\n\n\n\n\n\n\nexports.accuSettings=function(accu,hashes){hashes=exports.flatten(hashes);\n\nvar hl=hashes.length;\nfor(var h=0;h<hl;++h){\nvar hash=hashes[h];\nfor(var o in hash)accu[o]=hash[o];\n\n}\nreturn accu;\n};\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nexports.parseURL=function(str){var o=exports.parseURL.options,m=o.parser.exec(str),uri={},i=14;\n\n\n\n\n\nwhile(i-- )uri[o.key[i]]=m[i]||\"\";\n\nuri[o.q.name]={};\nuri[o.key[12]].replace(o.q.parser,function($0,$1,$2){if($1)uri[o.q.name][$1]=$2;\n\n});\n\nreturn uri;\n};\nexports.parseURL.options={key:[\"source\",\"protocol\",\"authority\",\"userInfo\",\"user\",\"password\",\"host\",\"port\",\"relative\",\"path\",\"directory\",\"file\",\"query\",\"anchor\"],q:{name:\"queryKey\",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:/^(?:([^:\\/?#]+):)?(?:\\/\\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\\/?#]*)(?::(\\d*))?))?((((?:[^?#\\/]*\\/)*)([^?#]*))(?:\\?([^#]*))?(?:#(.*))?)/};\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nexports.constructQueryString=function(){var hashes=exports.flatten(arguments);\n\nvar hl=hashes.length;\nvar parts=[];\nfor(var h=0;h<hl;++h){\nvar hash=hashes[h];\nfor(var q in hash){\nvar l=encodeURIComponent(q)+\"=\";\nvar val=hash[q];\nif(!exports.isArrayOrArguments(val))parts.push(l+encodeURIComponent(val));else{\n\n\nfor(var i=0;i<val.length;++i)parts.push(l+encodeURIComponent(val[i]));\n\n}\n}\n}\nreturn parts.join(\"&\");\n};\n\n\n\n\n\n\n\n\nexports.constructURL=function(){var url_spec=exports.flatten(arguments);\n\nvar l=url_spec.length;\nvar rv=url_spec[0];\n\n\nfor(var i=1;i<l;++i){\nvar comp=url_spec[i];\nif(typeof comp!=\"string\")break;\nif(rv.charAt(rv.length-1)!=\"/\")rv+=\"/\";\nrv+=comp.charAt(0)==\"/\"?comp.substr(1):comp;\n}\n\n\nvar qparts=[];\nfor(;i<l;++i){\nvar part=exports.constructQueryString(url_spec[i]);\nif(part.length)qparts.push(part);\n\n}\nvar query=qparts.join(\"&\");\nif(query.length){\nif(rv.indexOf(\"?\")!=-1)rv+=\"&\";else rv+=\"?\";\n\n\n\nrv+=query;\n}\nreturn rv;\n};\n\n\n\n\n\n\n\nexports.isSameOrigin=function(url1,url2){var a1=exports.parseURL(url1).authority;\n\nif(!a1)return true;\nvar a2=exports.parseURL(url2).authority;\nreturn !a2||(a1==a2);\n};\n\n\n\n\n\n\n\n\n\n\nexports.canonicalizeURL=function(url,base){var a=exports.parseURL(url);\n\n\n\nif(!a.protocol&&base){\nbase=exports.parseURL(base);\na.protocol=base.protocol;\nif(!a.authority){\na.authority=base.authority;\nif(!a.directory.length||a.directory.charAt(0)!=\'/\'){\n\na.directory=(base.directory||\"/\")+a.directory;\n}\n}\n}\n\n\nvar pin=a.directory.split(\"/\");\nvar l=pin.length;\nvar pout=[];\nfor(var i=0;i<l;++i){\nvar c=pin[i];\nif(c==\".\")continue;\nif(c==\"..\"&&pout.length>1)pout.pop();else pout.push(c);\n\n\n\n}\na.directory=pout.join(\"/\");\n\n\nvar rv=\"\";\nif(a.protocol)rv+=a.protocol+\":\";\nif(a.authority)rv+=\"//\"+a.authority;else if(a.protocol==\"file\")rv+=\"//\";\n\n\n\nrv+=a.directory+a.file;\nif(a.query)rv+=\"?\"+a.query;\nif(a.anchor)rv+=\"#\"+a.anchor;\nreturn rv;\n};\n\n\n\n\n\n\n\n\n\n\n\nexports.jsonp=jsonp_hostenv;\n\n\n\n\n\n\n\nexports.getXDomainCaps=getXDomainCaps_hostenv;\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nexports.request=request_hostenv;\n\n\n\n\n\n\nexports.makeMemoizedFunction=function(f,keyfn){var lookups_in_progress={};\n\n\nvar memoizer=function(){var key=keyfn?keyfn.apply(this,arguments):arguments[0];\n\nvar rv=memoizer.db[key];\nif(rv!==undefined)return rv;\nif(!lookups_in_progress[key])lookups_in_progress[key]=spawn (function(args){\nreturn memoizer.db[key]=f.apply(this,args);\n\n})(arguments);\ntry{\nreturn lookups_in_progress[key].waitforValue();\n}finally{\n\nif(lookups_in_progress[key].waiting()==0){\nlookups_in_progress[key].abort();\ndelete lookups_in_progress[key];\n}\n}\n};\n\nmemoizer.db={};\nreturn memoizer;\n};\n\n\n\n\nif(__oni_rt.UA==\"msie\"&&__oni_rt.G.execScript){\n\n\n\n\n\n\nvar IE_resume_counter=0;\n__oni_rt.IE_resume={};\n\nexports.eval=function(code,settings){var filename=(settings&&settings.filename)||\"\'sjs_eval_code\'\";\n\nvar mode=(settings&&settings.mode)||\"normal\";\ntry{\nwaitfor(var rv,isexception){\nvar rc=++IE_resume_counter;\n__oni_rt.IE_resume[rc]=resume;\nvar js=__oni_rt.c1.compile(\"try{\"+code+\"\\n}catchall(rv) { spawn(hold(0),__oni_rt.IE_resume[\"+rc+\"](rv[0],rv[1])) }\",{filename:filename,mode:mode});\n\n\n__oni_rt.G.execScript(js);\n}\nif(isexception)throw rv;\n}finally{\n\ndelete __oni_rt.IE_resume[rc];\n}\nreturn rv;\n};\n}else{\n\n\nexports.eval=function(code,settings){var filename=(settings&&settings.filename)||\"\'sjs_eval_code\'\";\n\nvar mode=(settings&&settings.mode)||\"normal\";\nvar js=__oni_rt.c1.compile(code,{filename:filename,mode:mode});\nreturn __oni_rt.G.eval(js);\n};\n}\n\n\n\n\nvar pendingLoads={};\n\n\n\n\nfunction makeRequire(parent){var rf=function(module,settings){\n\nvar opts=exports.accuSettings({},[settings]);\n\n\nif(opts.callback){\n(spawn (function(){try{\n\nvar rv=requireInner(module,rf,parent,opts);\n}catch(e){\n\nopts.callback(e);return 1;\n}\nopts.callback(undefined,rv);\n})());\n}else return requireInner(module,rf,parent,opts);\n\n\n};\nrf.path=\"\";\nrf.alias={};\n\n\nif(exports.require){\nrf.hubs=exports.require.hubs;\nrf.modules=exports.require.modules;\nrf.extensions=exports.require.extensions;\n}else{\n\n\nrf.hubs=getHubs_hostenv();\nrf.modules={};\n\nrf.extensions=getExtensions_hostenv();\n}\nreturn rf;\n}\n\n\nfunction resolveAliases(module,aliases){var ALIAS_REST=/^([^:]+):(.*)$/;\n\nvar alias_rest,alias;\nvar rv=module;\nvar level=10;\nwhile((alias_rest=ALIAS_REST.exec(rv))&&(alias=aliases[alias_rest[1]])){\n\nif(--level==0)throw \"Too much aliasing in modulename \'\"+module+\"\'\";\n\nrv=alias+alias_rest[2];\n}\nreturn rv;\n}\n\n\nfunction resolveHubs(module,hubs,opts){var path=module;\n\nvar loader=opts.loader||default_loader;\nvar src=opts.src||default_src_loader;\nvar level=10;\nfor(var i=0,hub;hub=hubs[i++ ];){\nif(path.indexOf(hub[0])==0){\n\nif(typeof hub[1]==\"string\"){\npath=hub[1]+path.substring(hub[0].length);\ni=0;\nif(--level==0)throw \"Too much indirection in hub resolution for module \'\"+module+\"\'\";\n\n}else if(typeof hub[1]==\"object\"){\n\nif(hub[1].src)src=hub[1].src;\nif(hub[1].loader)loader=hub[1].loader;\n\nbreak;\n}else throw \"Unexpected value for require.hubs element \'\"+hub[0]+\"\'\";\n\n\n}\n}\nreturn {path:path,loader:loader,src:src};\n}\n\n\nfunction default_src_loader(path){throw new Error(\"Don\'t know how to load module at \"+path);\n\n}\n\nfunction default_loader(path,parent,src){return getNativeModule(path,parent,src);\n\n}\n\nfunction http_src_loader(path){var src;\n\nif(getXDomainCaps_hostenv()!=\'none\'||exports.isSameOrigin(path,document.location))src=request_hostenv(path,{mime:\"text/plain\"});else{\n\n\n\n\npath+=\"!modp\";\nsrc=jsonp_hostenv(path,{forcecb:\"module\",cbfield:null});\n\n\n}\nreturn {src:src,loaded_from:path};\n}\n\n\nvar github_api=\"http://github.com/api/v2/json/\";\nvar github_opts={cbfield:\"callback\"};\n\n\nvar resolve_github_repo=exports.makeMemoizedFunction(function resolve(user,repo,tag){\nvar tree_sha;\n\n\n\n\n\n\n\n\n\n\nwaitfor{\n(tree_sha=jsonp_hostenv([github_api,\'repos/show/\',user,repo,\'/tags\'],github_opts).tags[tag])||hold();\n\n}or{\n\n(tree_sha=jsonp_hostenv([github_api,\'repos/show/\',user,repo,\'/branches\'],github_opts).branches[tag])||hold();\n\n}or{\n\nhold(10000);\nthrow new Error(\"Github timeout\");\n}\nreturn tree_sha;\n},function key(user,repo,tag){\n\nreturn user+\'/\'+repo+\'/\'+tag;\n\n});\n\n\n\nfunction github_src_loader(path){var user,repo,tag;\n\ntry{\n[ ,user,repo,tag,path]=/github:([^\\/]+)\\/([^\\/]+)\\/([^\\/]+)\\/(.+)/.exec(path);\n}catch(e){throw \"Malformed module id \'\"+path+\"\'\"}\n\nvar tree_sha=resolve_github_repo(user,repo,tag);\n\nwaitfor{\nvar src=jsonp_hostenv([github_api,\'blob/show/\',user,repo,tree_sha,path],github_opts).blob.data;\n\n}or{\n\nhold(10000);\nthrow new Error(\"Github timeout\");\n}\n\nreturn {src:src,loaded_from:\"http://github.com/\"+user+\"/\"+repo+\"/blob/\"+tree_sha+\"/\"+path};\n\n\n\n}\n\nfunction getNativeModule(path,parent,src_loader){var extension;\n\n\nvar matches=/.+\\.([^\\.\\/]+)$/.exec(path);\nif(!matches){\n\nextension=\"sjs\";\npath+=\".sjs\";\n}else extension=matches[1];\n\n\n\nvar compile=exports.require.extensions[extension];\nif(!compile)throw \"Unknown type \'\"+extension+\"\'\";\n\n\nvar descriptor;\nif(!(descriptor=exports.require.modules[path])){\n\nvar pendingHook=pendingLoads[path];\nif(!pendingHook){\npendingHook=pendingLoads[path]=spawn (function(){var src,loaded_from;\n\nif(typeof src_loader===\"string\"){\nsrc=src_loader;\nloaded_from=\"[src string]\";\n}else if(path in __oni_rt.modsrc){\n\n\nloaded_from=\"[builtin]\";\nsrc=__oni_rt.modsrc[path];\ndelete __oni_rt.modsrc[path];\n\n}else{\n\n({src,loaded_from})=src_loader(path);\n}\nvar descriptor={id:path,exports:{},loaded_from:loaded_from,loaded_by:parent,required_by:{},require:makeRequire(path)};\n\n\n\n\n\n\n\ncompile(src,descriptor);\n\n\n\n\n\nexports.require.modules[path]=descriptor;\n\nreturn descriptor;\n})();\n}\ntry{\nvar descriptor=pendingHook.waitforValue();\n}finally{\n\n\nif(pendingHook.waiting()==0)delete pendingLoads[path];\n\n}\n}\n\nif(!descriptor.required_by[parent])descriptor.required_by[parent]=1;else ++descriptor.required_by[parent];\n\n\n\n\nreturn descriptor.exports;\n}\n\n\nfunction requireInner(module,require_obj,parent,opts){try{\n\n\nvar path=resolveAliases(module,require_obj.alias);\n\n\nif(path.indexOf(\":\")==-1)path=resolveRelReqURL_hostenv(path,require_obj,parent);\n\n\nif(parent==__oni_rt.G.__oni_rt_require_base)parent=\"[toplevel]\";\n\n\n\nvar loader,src;\n({path,loader,src})=resolveHubs(path,exports.require.hubs,opts);\n\n\npath=exports.canonicalizeURL(path);\n\n\nreturn loader(path,parent,src);\n}catch(e){\n\nvar mes=\"Cannot load module \'\"+module+\"\'. \"+\"(Underlying exception: \"+e+\")\";\n\nthrow new Error(mes);\n}\n}\n\n\nexports.require=makeRequire(__oni_rt.G.__oni_rt_require_base);\n\nexports.require.modules[\'sjs:apollo-sys.sjs\']={id:\'sjs:apollo-sys.sjs\',exports:exports,loaded_from:\"[builtin]\",loaded_by:\"[toplevel]\",required_by:{\"[toplevel]\":1}};\n\n\n\n\n\n\n\nexports.init=function(cb){init_hostenv();\n\ncb();\n};\n\n";__oni_rt.modsrc['sjs:apollo-sys-xbrowser.sjs']="function jsonp_hostenv(url,settings){\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nvar opts=exports.accuSettings({},[{iframe:false,cbfield:\"callback\"},settings]);\n\n\n\n\n\n\n\n\n\n\nurl=exports.constructURL(url,opts.query);\nif(opts.iframe||opts.forcecb)return jsonp_iframe(url,opts);else return jsonp_indoc(url,opts);\n\n\n\n};\n\nvar jsonp_req_count=0;\nvar jsonp_cb_obj=\"_oni_jsonpcb\";\nfunction jsonp_indoc(url,opts){if(!window[jsonp_cb_obj])window[jsonp_cb_obj]={};\n\n\nvar cb=\"cb\"+(jsonp_req_count++ );\nvar cb_query={};\ncb_query[opts.cbfield]=jsonp_cb_obj+\".\"+cb;\nurl=exports.constructURL(url,cb_query);\nvar elem=document.createElement(\"script\");\nelem.setAttribute(\"src\",url);\nelem.setAttribute(\"async\",\"async\");\nelem.setAttribute(\"type\",\"text/javascript\");\nwaitfor(var rv){\nwindow[jsonp_cb_obj][cb]=resume;\ndocument.getElementsByTagName(\"head\")[0].appendChild(elem);\n\nwaitfor(){\nif(elem.addEventListener)elem.addEventListener(\"error\",resume,false);else elem.attachEvent(\"onerror\",resume);\n\n\n\n}finally{\n\nif(elem.removeEventListener)elem.removeEventListener(\"error\",resume,false);else elem.detachEvent(\"onerror\",resume);\n\n\n\n}\n\nthrow new Error(\"Could not complete JSONP request to \'\"+url+\"\'\");\n}finally{\n\nelem.parentNode.removeChild(elem);\ndelete window[jsonp_cb_obj][cb];\n}\nreturn rv;\n}\n\nfunction jsonp_iframe(url,opts){var cb=opts.forcecb||\"R\";\n\nvar cb_query={};\nif(opts.cbfield)cb_query[opts.cbfield]=cb;\n\nurl=exports.constructURL(url,cb_query);\nvar iframe=document.createElement(\"iframe\");\ndocument.getElementsByTagName(\"head\")[0].appendChild(iframe);\nvar doc=iframe.contentWindow.document;\nwaitfor(var rv){\ndoc.open();\niframe.contentWindow[cb]=resume;\n\n\nhold(0);\ndoc.write(\"\\x3Cscript type=\'text/javascript\' src=\\\"\"+url+\"\\\">\\x3C/script>\");\ndoc.close();\n}finally{\n\niframe.parentNode.removeChild(iframe);\n}\n\n\nhold(0);\nreturn rv;\n};\n\n\nvar XHR_caps;\nvar activex_xhr_ver;\n\nfunction getXHRCaps(){if(!XHR_caps){\n\nXHR_caps={};\n\nif(__oni_rt.G.XMLHttpRequest)XHR_caps.XHR_ctor=function(){\nreturn new XMLHttpRequest()};else XHR_caps.XHR_ctor=function(){\n\nif(activex_xhr_ver!==undefined)return new ActiveXObject(activex_xhr_ver);\n\n\nfor(var v in {\"MSXML2.XMLHTTP.6.0\":1,\"MSXML2.XMLHTTP.3.0\":1,\"MSXML2.XMLHTTP\":1}){\n\n\n\n\ntry{\nvar req=new ActiveXObject(v);\nactivex_xhr_ver=v;\nreturn req;\n}catch(e){\n}\n}\nthrow new Error(\"Browser does not support XMLHttpRequest\");\n};\n\n\nXHR_caps.XHR_CORS=(\"withCredentials\" in XHR_caps.XHR_ctor());\nif(!XHR_caps.XHR_CORS)XHR_caps.XDR=(__oni_rt.G.XDomainRequest!==undefined);\n\nXHR_caps.CORS=(XHR_caps.XHR_CORS||XHR_caps.XDR)?\"CORS\":\"none\";\n}\nreturn XHR_caps;\n}\n\n\n\n\n\n\nfunction getXDomainCaps_hostenv(){return getXHRCaps().CORS;\n\n}\n\n\n\n\n\n\n\n\n\nfunction resolveRelReqURL_hostenv(url_string,req_obj,parent){if(req_obj.path&&req_obj.path.length)url_string=exports.constructURL(req_obj.path,url_string);\n\n\nreturn exports.canonicalizeURL(url_string,parent?parent:document.location.href);\n}\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nfunction request_hostenv(url,settings){var opts=exports.accuSettings({},[{method:\"GET\",body:null,throwing:true},settings]);\n\n\n\n\n\n\n\n\n\n\n\n\n\nurl=exports.constructURL(url,opts.query);\n\nvar caps=getXHRCaps();\nif(!caps.XDR||exports.isSameOrigin(url,document.location)){\nvar req=caps.XHR_ctor();\nreq.open(opts.method,url,true,opts.username||\"\",opts.password||\"\");\n}else{\n\n\nreq=new XDomainRequest();\nreq.open(opts.method,url);\n}\n\nwaitfor(var error){\nif(req.onerror!==undefined){\nreq.onload=function(){resume()};\nreq.onerror=function(){resume(true)};\n}else{\n\nreq.onreadystatechange=function(evt){if(req.readyState!=4)return;else resume();\n\n\n\n\n};\n}\n\nif(opts.headers)for(var h in opts.headers)req.setRequestHeader(h,opts.headers[h]);\n\n\nif(opts.mime&&req.overrideMimeType)req.overrideMimeType(opts.mime);\n\nreq.send(opts.body);\n}retract{\n\nreq.abort();\n}\n\n\nif(error||(req.status!==undefined&&!(req.status.toString().charAt(0) in {\'0\':1,\'2\':1}))){\n\n\nif(opts.throwing){\nvar txt=\"Failed \"+opts.method+\" request to \'\"+url+\"\'\";\nif(req.statusText)txt+=\": \"+req.statusText;\nif(req.status)txt+=\" (\"+req.status+\")\";\nvar err=new Error(txt);\nerr.status=req.status;\nthrow err;\n}else return \"\";\n\n\n}\nreturn req.responseText;\n}\n\n\n\n\nfunction getHubs_hostenv(){var scripts=document.getElementsByTagName(\"script\"),matches;\n\n\nvar location;\nfor(var i=0;i<scripts.length;++i){\nif((matches=/(.*)oni-apollo.js$/.exec(scripts[i].src))){\nlocation=exports.canonicalizeURL(matches[1]+\"modules/\",document.location.href);\nbreak;\n}\n}\n\nreturn [[\"apollo:\",location?location:{src:function(path){\n\n\nthrow new Error(\"Can\'t load module \'\"+path+\"\': The location of the apollo standard module lib is unknown - it can only be inferred automatically if you load oni-apollo.js in the normal way through a <script> element.\");\n\n}}],[\"github:\",{src:github_src_loader}],[\"http:\",{src:http_src_loader}],[\"https:\",{src:http_src_loader}]];\n\n\n\n\n\n}\n\nfunction getExtensions_hostenv(){return {\'sjs\':function(src,descriptor){\n\n\nvar f=exports.eval(\"(function(module,exports,require){\"+src+\"})\",{filename:\"module \'\"+descriptor.id+\"\'\"});\n\n\nf(descriptor,descriptor.exports,descriptor.require);\n},\'js\':function(src,descriptor){\n\nvar f=new Function(\"module\",\"exports\",src);\n\nf.apply(descriptor.exports,[descriptor,descriptor.exports]);\n}};\n\n}\n\n\n\n\n__oni_rt.G.require=__oni_rt.sys.require;\n\n\n\n\nhostenv_init=function(){};\n\n\n\n\nif(!__oni_rt.G.__oni_rt_no_script_load){\nfunction runScripts(){var scripts=document.getElementsByTagName(\"script\");\n\n\n\n\n\n\n\n\n\nvar ss=[];\nfor(var i=0;i<scripts.length;++i){\nif(scripts[i].getAttribute(\"type\")==\"text/sjs\"){\nvar s=scripts[i];\nss.push(s);\n}\n}\n\nfor(var i=0;i<ss.length;++i){\nvar s=ss[i];\nvar m=s.getAttribute(\"module\");\n\nvar content=s.textContent||s.innerHTML;\nif(__oni_rt.UA==\"msie\"){\n\ncontent=content.replace(/\\r\\n/,\"\");\n}\nif(m)__oni_rt.modsrc[m]=content;else exports.eval(content,{filename:\"inline_script\"+(i+1)});\n\n\n\n}\n};\n\nif(document.readyState===\"complete\"){\nrunScripts();\n}else{\n\n\nif(__oni_rt.G.addEventListener)__oni_rt.G.addEventListener(\"load\",runScripts,true);else __oni_rt.G.attachEvent(\"onload\",runScripts);\n\n\n\n}\n}\n\n\n";if(!Array.isArray){

















































































Array.isArray=function(o){return Object.prototype.toString.call(o)==='[object Array]';

};
}


if(!Array.prototype.indexOf){
Array.prototype.indexOf=function(val){var len=this.length>>>0;

var i=Math.floor(arguments[1]||0);
if(i<0)i=Math.max(len-Math.abs(i),0);

for(;i<len;++i){
if(i in this&&this[i]===val)return i;

}
return -1;
};
}


if(!Array.prototype.lastIndexOf){
Array.prototype.lastIndexOf=function(val){var len=this.length>>>0;

var i=arguments[1]===undefined?len:Math.floor(arguments[1]);
if(i>=0)i=Math.min(i,len-1);else i+=len;




for(;i>=0;--i){
if(i in this&&this[i]===val)return i;

}
return -1;
};
}


if(!Object.keys){




Object.keys=function(o){var rv=[],p;

for(p in o)if(Object.prototype.hasOwnProperty.call(o,p))rv.push(p);


return rv;
};
}


if(!Function.prototype.bind){




Function.prototype.bind=function(obj){var slice=[].slice,args=slice.call(arguments,1),self=this,nop=function(){



},bound=function(){
return self.apply(this instanceof nop?this:(obj||{}),args.concat(slice.call(arguments)));


};


nop.prototype=self.prototype;
bound.prototype=new nop();
return bound;
};
}








if(!__oni_rt.sys){







































__oni_rt.G.eval("(function(exports) {"+__oni_rt.c1.compile(__oni_rt.modsrc['sjs:apollo-sys-common.sjs'],{filename:"apollo-sys-common.sjs"})+"\n"+__oni_rt.c1.compile(__oni_rt.modsrc['sjs:apollo-sys-'+__oni_rt.hostenv+'.sjs'],{filename:"apollo-sys-"+__oni_rt.hostenv+".sjs"})+"})({})");





delete __oni_rt.modsrc['sjs:apollo-sys-common.sjs'];
delete __oni_rt.modsrc['sjs:apollo-sys-'+__oni_rt.hostenv+'.sjs'];
}




