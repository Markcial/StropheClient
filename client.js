var BOSH_SERVICE = '/http-bind/';
Client = function(login,passwd){
  self = this;
  self.connect(login,passwd);
  self.lastMessage;
  self.messageEvent = function(message){ return; };
  self.onUserSubscribe = function(uinfo){ return; };
  self.onUserSubscribed = function(uinfo){ return; };
  self.onUserUnsubscribe = function(uinfo){ return; };
  self.onUserUnsubscribed = function(uinfo){ return; };
  window.onbeforeunload = self.disconnect;
}
Client.prototype = {
  connection:{},
  contactList:{},
  connect:function(login,passwd){
    self.connection = new Strophe.Connection(BOSH_SERVICE);
    self.connection.connect(login,passwd,self._onConnect);
  },
  _isConnected:function(){
     var avail = $pres({type:'avaliable'}).c('status');
     self._addHandlers();
	 //self.getContactList();
     self.connection.send(avail.tree());
	 //self._testEnterChatRoom();
  },
  //_testEnterChatRoom:function(){
  //	var pres = $iq({
//		type: 'get',
//		to:'localhost'
//	}).c('query',{xmlns:Strophe.NS.DISCO_INFO});
//	//var pres = $pres({to:'lobby@chatrooms.localhost/pepito'}).c('x',{xmlns:Strophe.NS.MUC});
//	
//	self.connection.send(pres.tree());
//  },
  _onUserSubscribe:function(stanza){
  	var from = Strophe.getBareJidFromJid($(stanza).attr('from'));
	var to = Strophe.getBareJidFromJid($(stanza).attr('to'));
	var uinfo = {
		from:from,
		to:to
	}
	self.onUserSubscribe(uinfo);
	return true; // make it persistent
  },
  _onUserSubscribed:function(stanza){
  	var from = Strophe.getBareJidFromJid($(stanza).attr('from'));
	var to = Strophe.getBareJidFromJid($(stanza).attr('to'));
	var uinfo = {
		from:from,
		to:to
	}
	self.onUserSubscribed(uinfo);
	return true; // make it persistent
  },
  _onUserUnsubscribe:function(stanza){
  	var from = Strophe.getBareJidFromJid($(stanza).attr('from'));
	var to = Strophe.getBareJidFromJid($(stanza).attr('to'));
	var uinfo = {
		from:from,
		to:to
	}
	self.onUserUnsubscribe(uinfo);
	return true; // make it persistent
  },
  _onUserUnsubscribed:function(stanza){
  	var from = Strophe.getBareJidFromJid($(stanza).attr('from'));
	var to = Strophe.getBareJidFromJid($(stanza).attr('to'));
	var uinfo = {
		from:from,
		to:to
	}
	self.onUserUnsubscribed(uinfo);
	return true; // make it persistent
  },
  _onMessageReceived:function(stanza){
    var from = $(stanza).attr('from');
    var sbj = $(stanza).find("subject").length>0?$(stanza).find("subject").text():null;
    var msg = $(stanza).find("body").text();
    var message = {
		from:from,
		subject:sbj,
		message:msg
	};
	self.messageEvent(message);
	self.lastMessage = message;
  	return true; // return true to make it persistent
  },
  _addHandlers:function(){
  	self.connection.addHandler(self._onUserSubscribe,null,"presence","subscribe"); // presence subscribe handler
  	self.connection.addHandler(self._onUserSubscribed,null,"presence","subscribed"); // presence subscribed handler
  	self.connection.addHandler(self._onUserUnsubscribe,null,"presence","unsubscribe"); // presence unsubscribe handler
  	self.connection.addHandler(self._onUserUnsubscribed,null,"presence","unsubscribed"); // presence unsubscribed handler
  	self.connection.addHandler(self._onMessageReceived,null,"message"); // message handler
  },
  _onConnect : function(status){
    if (status == Strophe.Status.CONNECTING) {
    } else if (status == Strophe.Status.CONNFAIL) {
	} else if (status == Strophe.Status.DISCONNECTING) {
    } else if (status == Strophe.Status.DISCONNECTED) {
	} else if (status == Strophe.Status.CONNECTED) {
	  self._isConnected();
    }
  },
  _onContactListComplete:function(stanza){
  	$("query item",stanza).each(function(i,el){
	  var name = $(el).attr("name");
	  var jid = $(el).attr("jid");
	  var subsc = $(el).attr("subscription");
	  var group = $(el,"group").text();
	  var contact = {
	  	name:name,
		jid:Strophe.getBareJidFromJid(jid),
		subscription:subsc
	  };
	  !self.contactList[group]?
	   self.contactList[group] = [] : false;
	  self.contactList[group].push(contact);
	})
	console.log(self.contactList);
  },
  _onContactListError:function(msg){
  	console.log(msg);
  },
  getContactList:function(){
    var gl = $iq({type:'get'}).c('query',{xmlns:Strophe.NS.ROSTER});
    self.connection.sendIQ(gl.tree(),self._onContactListComplete,self._onContactListError);
  },
  sendFriendRequest:function(jid){
    if (self.connection.connected && self.connection.authenticated) {
      var subs = $pres({to:jid,type:'subscribe'});
      self.connection.send(subs);
    }else{
      console.log("not logged in");
    }
  },
  acceptFriendRequest:function(jid){
  	if (self.connection.connected && self.connection.authenticated) {
      var subs = $pres({to:jid,type:'subscribed'});
      self.connection.send(subs);
    }else{
      console.log("not logged in");
    }
  },
  disconnect:function(){
    self.connection.disconnect();
  }
}