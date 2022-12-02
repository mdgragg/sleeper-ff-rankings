(window["webpackJsonpff-league-rankings"]=window["webpackJsonpff-league-rankings"]||[]).push([[0],{16:function(e,a,t){e.exports=t.p+"static/media/logo_with_text.7214a3e6.png"},19:function(e,a,t){e.exports=t(32)},24:function(e,a,t){},32:function(e,a,t){"use strict";t.r(a);var n=t(0),s=t.n(n),r=t(14),l=t.n(r),i=t(17),o=t(1),c=(t(24),t(15)),m=t(9);var p=function(e){var a=e.leagueData,t=a.owners,n=a.teams,r=a.matchup,l=a.currentWeek-1,i=a.size-1,o="https://sleepercdn.com/avatars/thumbs/",c=t.slice(0).sort((function(e,a){return e.pointsFor-a.pointsFor})),m=t.slice(0).sort((function(e,a){return e.pointsAgainst-a.pointsAgainst})),p=t.slice(0).sort((function(e,a){return e.pointsPossiblePerc-a.pointsPossiblePerc})),u=c[i],E=c[0],d=m[i],h=m[0],v=p[i],f=p[0];return s.a.createElement(s.a.Fragment,null,s.a.createElement("div",{id:"awards"},s.a.createElement("h2",null,"Season Awards"),s.a.createElement("div",{className:"awards"},s.a.createElement("div",{className:"box weekly-winner"},s.a.createElement("h3",null,s.a.createElement("span",{className:"emoji",role:"img","aria-label":""},"\ud83d\udcb0")," ","Highest Scorer"," ",s.a.createElement("span",{className:"username good"}," @",u.userName)),s.a.createElement("div",{className:"owner-block"},s.a.createElement("span",{className:"stat"},u.pointsFor," points"))),s.a.createElement("div",{className:"box"},s.a.createElement("h3",null,s.a.createElement("span",{className:"emoji",role:"img","aria-label":""},"\ud83d\udca9"),"Lowest Scorer"," ",s.a.createElement("span",{className:"username bad"},"@",E.userName)),s.a.createElement("div",{className:"owner-block"},s.a.createElement("span",{className:"stat"},E.pointsFor," points"))),s.a.createElement("div",{className:"box"},s.a.createElement("h3",null,s.a.createElement("span",{className:"emoji",role:"img","aria-label":""},"\ud83c\udf40"),"Best Luck ",s.a.createElement("span",{className:"username good"},"@",h.userName)),s.a.createElement("div",{className:"desc"},"(least points against)"),s.a.createElement("div",{className:"owner-block"},s.a.createElement("span",{className:"stat"},h.pointsAgainst," points"))),s.a.createElement("div",{className:"box"},s.a.createElement("h3",null,s.a.createElement("span",{className:"emoji",role:"img","aria-label":""},"\ud83e\udd2c"),"Worst Luck"," ",s.a.createElement("span",{className:"username bad"},"@",d.userName)),s.a.createElement("div",{className:"desc"},"(most points against)"),s.a.createElement("div",{className:"owner-block"},s.a.createElement("span",{className:"stat"},d.pointsAgainst," points"))),s.a.createElement("div",{className:"box"},s.a.createElement("h3",null,s.a.createElement("span",{className:"emoji",role:"img","aria-label":""},"\ud83d\udd25"),"Best Manager"," ",s.a.createElement("span",{className:"username good"}," @",v.userName)),s.a.createElement("div",{className:"desc"},"(highest percentage of possible points scored)"),s.a.createElement("div",{className:"owner-block"},s.a.createElement("span",{className:"stat"},v.pointsPossiblePerc,"%"))),s.a.createElement("div",{className:"box"},s.a.createElement("h3",null,s.a.createElement("span",{className:"emoji",role:"img","aria-label":""},"\ud83e\udd14"),"Worst Manager",s.a.createElement("span",{className:"username bad"}," @",f.userName)),s.a.createElement("div",{className:"desc"},"(lowest percentage of possible points scored)"),s.a.createElement("div",{className:"owner-block"},s.a.createElement("span",{className:"stat"},f.pointsPossiblePerc,"%"))))),s.a.createElement("div",{className:"standings"},s.a.createElement("li",{className:"container-".concat(t[3].roster_id," container weekly-winner"),key:t[3].ownerID},s.a.createElement("span",{className:"ranking first"},"1"),s.a.createElement("img",{src:n[6].avatar||o+t[6].avatar,className:"avatar weekly-winner-circle"}),s.a.createElement("div",{className:"name-desc"},s.a.createElement("span",{className:"clinched-playoffs"},"Clinched Playoffs"),s.a.createElement("span",{className:"clinched-bye"},"Clinched Round 1 Bye"),s.a.createElement("h3",null,t[6].teamName," (",t[6].wins,"-",t[6].losses,t[6].ties?"-"+t[6].ties:"",")",s.a.createElement("span",{className:"wins"}," ",t[6].streak)),s.a.createElement("span",{className:"owner-name"},"@",n[6].username),s.a.createElement("p",null,"Called out team in the chat and team responded mid-week."),s.a.createElement("span",{className:"winning-weeks"},"Highest Scorer: Week 1, Week 5, Week 6, Week 12")),s.a.createElement("div",{className:"stats"},s.a.createElement("h4",null,"Team Stats"),s.a.createElement("p",null,s.a.createElement("span",null,"Total points: ",t[6].pointsFor),s.a.createElement("span",null," ","Week ",l," Points: ",r[6].points),s.a.createElement("span",null," Possible Points: ",t[6].pointsPossible),s.a.createElement("span",null," Points Against: ",t[6].pointsAgainst),s.a.createElement("span",{className:"priority"}," ","Waiver Priority: ",t[6].waiverOrder)))),s.a.createElement("li",{className:"container-".concat(t[1].roster_id," container playoffs"),key:t[1].ownerID},s.a.createElement("span",{className:"ranking clinched"},"2"),s.a.createElement("img",{src:n[3].avatar||o+t[3].avatar,className:"avatar playoffs-circle"}),s.a.createElement("div",{className:"name-desc"},s.a.createElement("span",{className:"clinched-playoffs"},"Clinched Playoffs"),s.a.createElement("h3",null,t[3].teamName," (",t[3].wins,"-",t[3].losses,t[3].ties?"-"+t[3].ties:"",")"," ",s.a.createElement("span",{className:"wins"}," ",t[3].streak)),s.a.createElement("span",{className:"owner-name"},"@",n[3].username),s.a.createElement("p",null,"I lied about clinching a first-round bye last week. But only way it's not clinched is if you lose next two and Brien wins out while outscoring you by 150."),s.a.createElement("span",{className:"winning-weeks"},"Highest Scorer: Week 3, Week 4, Week 9")),s.a.createElement("div",{className:"stats"},s.a.createElement("h4",null,"Team Stats"),s.a.createElement("p",null,s.a.createElement("span",null,"Total points: ",t[3].pointsFor),s.a.createElement("span",null," ","Week ",l," Points: ",r[3].points),s.a.createElement("span",null," Possible Points: ",t[3].pointsPossible),s.a.createElement("span",null," Points Against: ",t[3].pointsAgainst),s.a.createElement("span",{className:"priority"}," ","Waiver Priority: ",t[3].waiverOrder)))),s.a.createElement("li",{className:"container-".concat(t[2].roster_id," container "),key:t[2].ownerID}," ",s.a.createElement("span",{className:"ranking "},"3"),s.a.createElement("img",{src:n[1].avatar||o+t[1].avatar,className:"avatar "}),s.a.createElement("div",{className:"name-desc"},s.a.createElement("h3",null,t[1].teamName," (",t[1].wins,"-",t[1].losses,t[1].ties?"-"+t[1].ties:"",")",s.a.createElement("span",{className:"losses"}," ",t[1].streak)),s.a.createElement("span",{className:"owner-name"},"@",n[1].username),s.a.createElement("p",null,"So you're tell me there's a chance...")),s.a.createElement("div",{className:"stats"},s.a.createElement("h4",null,"Team Stats"),s.a.createElement("p",null,s.a.createElement("span",null,"Total points: ",t[1].pointsFor),s.a.createElement("span",null," ","Week ",l," Points: ",r[1].points),s.a.createElement("span",null," Possible Points: ",t[1].pointsPossible),s.a.createElement("span",null," Points Against: ",t[1].pointsAgainst),s.a.createElement("span",{className:"priority"}," ","Waiver Priority: ",t[1].waiverOrder)))),s.a.createElement("li",{className:"container-".concat(t[0].roster_id," container  "),key:t[0].ownerID}," ",s.a.createElement("span",{className:"ranking"},"4"),s.a.createElement("img",{src:n[7].avatar||o+t[7].avatar,className:"avatar "}),s.a.createElement("div",{className:"name-desc"},s.a.createElement("h3",null,t[7].teamName," (",t[7].wins,"-",t[7].losses,t[7].ties?"-"+t[7].ties:"",")",s.a.createElement("span",{className:"wins"}," ",t[7].streak)),s.a.createElement("span",{className:"owner-name"},"@",n[7].username),s.a.createElement("p",null,"Has yet to win or lose more than 2 games in a row."),s.a.createElement("span",{className:"winning-weeks"},"Highest Scorer: Week 11")),s.a.createElement("div",{className:"stats"},s.a.createElement("h4",null,"Team Stats"),s.a.createElement("p",null,s.a.createElement("span",null,"Total points: ",t[7].pointsFor),s.a.createElement("span",null," ","Week ",l," Points: ",r[7].points),s.a.createElement("span",null," Possible Points: ",t[7].pointsPossible),s.a.createElement("span",null," Points Against: ",t[7].pointsAgainst),s.a.createElement("span",{className:"priority"}," ","Waiver Priority: ",t[7].waiverOrder)))),s.a.createElement("li",{className:"container-".concat(t[4].roster_id," container "),key:t[4].ownerID}," ",s.a.createElement("span",{className:"ranking"},"5"),s.a.createElement("img",{src:n[0].avatar||o+t[0].avatar,className:"avatar "}),s.a.createElement("div",{className:"name-desc"},s.a.createElement("h3",null,t[0].teamName," (",t[0].wins,"-",t[0].losses,t[0].ties?"-"+t[0].ties:"",")",s.a.createElement("span",{className:"losses"}," ",t[0].streak)),s.a.createElement("span",{className:"owner-name"},"@",n[0].username),s.a.createElement("p",null,"Did not think I would have to make a decison between Goff or Garoppolo in week 12."," "),s.a.createElement("span",{className:"winning-weeks"},"Highest Scorer: Week 10")),s.a.createElement("div",{className:"stats"},s.a.createElement("h4",null,"Team Stats"),s.a.createElement("p",null,s.a.createElement("span",null,"Total points: ",t[0].pointsFor),s.a.createElement("span",null," ","Week ",l," Points: ",r[0].points),s.a.createElement("span",null," Possible Points: ",t[0].pointsPossible),s.a.createElement("span",null," Points Against: ",t[0].pointsAgainst),s.a.createElement("span",{className:"priority"}," ","Waiver Priority: ",t[0].waiverOrder)))),s.a.createElement("li",{className:"container-".concat(t[5].roster_id," container "),key:t[5].ownerID}," ",s.a.createElement("span",{className:"ranking"},"6"),s.a.createElement("img",{src:n[4].avatar||o+t[4].avatar,className:"avatar "}),s.a.createElement("div",{className:"name-desc"},s.a.createElement("h3",null,t[4].teamName," (",t[4].wins,"-",t[4].losses,t[4].ties?"-"+t[4].ties:"",")",s.a.createElement("span",{className:"wins"}," ",t[4].streak)),s.a.createElement("span",{className:"owner-name"},"@",n[4].username),s.a.createElement("p",null,"7 points away from the 5 seed but 1 loss or 100 points away for out of the playoffs."),s.a.createElement("span",{className:"winning-weeks"},"Highest Scorer: Week 7")),s.a.createElement("div",{className:"stats"},s.a.createElement("h4",null,"Team Stats"),s.a.createElement("p",null,s.a.createElement("span",null,"Total points: ",t[4].pointsFor),s.a.createElement("span",null," ","Week ",l," Points: ",r[4].points),s.a.createElement("span",null," Possible Points: ",t[4].pointsPossible),s.a.createElement("span",null," Points Against: ",t[4].pointsAgainst),s.a.createElement("span",{className:"priority"}," ","Waiver Priority: ",t[4].waiverOrder)))),s.a.createElement("li",{className:"container-".concat(t[6].roster_id," container "),key:t[6].ownerID}," ",s.a.createElement("span",{className:"ranking "},"7"),s.a.createElement("img",{src:n[2].avatar||o+t[2].avatar,className:"avatar "}),s.a.createElement("div",{className:"name-desc"},s.a.createElement("h3",null,t[2].teamName," (",t[2].wins,"-",t[2].losses,t[2].ties?"-"+t[2].ties:"",")",s.a.createElement("span",{className:"wins"}," ",t[2].streak)),s.a.createElement("span",{className:"owner-name"},"@",n[2].username),s.a.createElement("p",null,"Was a selling team just last week but keeps winning."),s.a.createElement("span",{className:"winning-weeks"},"Highest Scorer: Week 2")),s.a.createElement("div",{className:"stats"},s.a.createElement("h4",null,"Team Stats"),s.a.createElement("p",null,s.a.createElement("span",null,"Total points: ",t[2].pointsFor),s.a.createElement("span",null," ","Week ",l," Points: ",r[2].points),s.a.createElement("span",null," Possible Points: ",t[2].pointsPossible),s.a.createElement("span",null," Points Against: ",t[2].pointsAgainst),s.a.createElement("span",{className:"priority"}," ","Waiver Priority: ",t[2].waiverOrder)))),s.a.createElement("li",{className:"container-".concat(t[7].roster_id," container "),key:t[7].ownerID}," ",s.a.createElement("span",{className:"ranking "},"8"),s.a.createElement("img",{src:n[10].avatar||o+t[10].avatar,className:"avatar "}),s.a.createElement("div",{className:"name-desc"},s.a.createElement("h3",null,t[10].teamName," (",t[10].wins,"-",t[10].losses,t[10].ties?"-"+t[10].ties:"",")",s.a.createElement("span",{className:"wins"}," ",t[10].streak)),s.a.createElement("span",{className:"owner-name"},"@",n[10].username),s.a.createElement("p",null,"5-7 isnt great but points scored keeps you in the playoff conversation.")),s.a.createElement("div",{className:"stats"},s.a.createElement("h4",null,"Team Stats"),s.a.createElement("p",null,s.a.createElement("span",null,"Total points: ",t[10].pointsFor),s.a.createElement("span",null," ","Week ",l," Points: ",r[10].points),s.a.createElement("span",null," Possible Points: ",t[10].pointsPossible),s.a.createElement("span",null," Points Against: ",t[10].pointsAgainst),s.a.createElement("span",{className:"priority"}," ","Waiver Priority: ",t[10].waiverOrder)))),s.a.createElement("li",{className:"container-".concat(t[8].roster_id," container "),key:t[8].ownerID}," ",s.a.createElement("span",{className:"ranking"},"9"),s.a.createElement("img",{src:n[5].avatar||o+t[5].avatar,className:"avatar "}),s.a.createElement("div",{className:"name-desc"},s.a.createElement("h3",null,t[5].teamName," (",t[5].wins,"-",t[5].losses,t[5].ties?"-"+t[5].ties:"",")",s.a.createElement("span",{className:"losses"}," ",t[5].streak)),s.a.createElement("span",{className:"owner-name"},"@",n[5].username),s.a.createElement("p",null,"Josh Jacobs trying to get to the playoffs or at least away from least points scored.")),s.a.createElement("div",{className:"stats"},s.a.createElement("h4",null,"Team Stats"),s.a.createElement("p",null,s.a.createElement("span",null,"Total points: ",t[5].pointsFor),s.a.createElement("span",null," ","Week ",l," Points: ",r[5].points),s.a.createElement("span",null," Possible Points: ",t[5].pointsPossible),s.a.createElement("span",null," Points Against: ",t[5].pointsAgainst),s.a.createElement("span",{className:"priority"}," ","Waiver Priority: ",t[5].waiverOrder)))),s.a.createElement("li",{className:"container-".concat(t[9].roster_id," container "),key:t[9].ownerID}," ",s.a.createElement("span",{className:"ranking"},"10"),s.a.createElement("img",{src:n[9].avatar||o+t[9].avatar,className:"avatar "}),s.a.createElement("div",{className:"name-desc"},s.a.createElement("h3",null,t[9].teamName," (",t[9].wins,"-",t[9].losses,t[9].ties?"-"+t[9].ties:"",")",s.a.createElement("span",{className:"losses"}," ",t[9].streak)),s.a.createElement("span",{className:"owner-name"},"@",n[9].username),s.a.createElement("p",null,"Went from 1-5 to 4-5 to 4-8. The Cinderella Story might be over."),s.a.createElement("span",{className:"winning-weeks"},"Highest Scorer: Week 8")),s.a.createElement("div",{className:"stats"},s.a.createElement("h4",null,"Team Stats"),s.a.createElement("p",null,s.a.createElement("span",null,"Total points: ",t[9].pointsFor),s.a.createElement("span",null," ","Week ",l," Points: ",r[9].points),s.a.createElement("span",null," Possible Points: ",t[9].pointsPossible),s.a.createElement("span",null," Points Against: ",t[9].pointsAgainst),s.a.createElement("span",{className:"priority"}," ","Waiver Priority: ",t[9].waiverOrder)))),s.a.createElement("li",{className:"container-".concat(t[10].roster_id," container last-place"),key:t[10].ownerID}," ",s.a.createElement("span",{className:"ranking last"},"11"),s.a.createElement("img",{src:n[11].avatar||o+t[11].avatar,className:"avatar last-place-circle"}),s.a.createElement("div",{className:"name-desc"},s.a.createElement("span",{className:"eliminated"},"Eliminated from Playoffs"),s.a.createElement("h3",null,t[11].teamName," (",t[11].wins,"-",t[11].losses,t[11].ties?"-"+t[11].ties:"",")",s.a.createElement("span",{className:"losses"}," ",t[11].streak)),s.a.createElement("span",{className:"owner-name"},"@",n[11].username),s.a.createElement("p",null,"Needs a new defensive coordinator as it's only the 3rd time someone has scored under 135 points against you.. It's week 12."," ")),s.a.createElement("div",{className:"stats"},s.a.createElement("h4",null,"Team Stats"),s.a.createElement("p",null,s.a.createElement("span",null,"Total points: ",t[11].pointsFor),s.a.createElement("span",null," ","Week ",l," Points: ",r[11].points),s.a.createElement("span",null," Possible Points: ",t[11].pointsPossible),s.a.createElement("span",null," Points Against: ",t[11].pointsAgainst),s.a.createElement("span",{className:"priority"}," ","Waiver Priority: ",t[11].waiverOrder)))),s.a.createElement("li",{className:"container-".concat(t[11].roster_id," container last-place"),key:t[11].ownerID}," ",s.a.createElement("span",{className:"ranking last"},"12"),s.a.createElement("img",{src:n[8].avatar||o+t[8].avatar,className:"avatar last-place-circle"}),s.a.createElement("div",{className:"name-desc"},s.a.createElement("span",{className:"eliminated"},"Eliminated from Playoffs"),s.a.createElement("h3",null,t[8].teamName," (",t[8].wins,"-",t[8].losses,t[8].ties?"-"+t[8].ties:"",")",s.a.createElement("span",{className:"losses"}," ",t[8].streak)),s.a.createElement("span",{className:"owner-name"},"@",n[8].username),s.a.createElement("p",null,"Still holding off Opaskar for least points scored (9 point difference though).")),s.a.createElement("div",{className:"stats"},s.a.createElement("h4",null,"Team Stats"),s.a.createElement("p",null,s.a.createElement("span",null,"Total points: ",t[8].pointsFor),s.a.createElement("span",null," ","Week ",l," Points: ",r[8].points),s.a.createElement("span",null," Possible Points: ",t[8].pointsPossible),s.a.createElement("span",null," Points Against: ",t[8].pointsAgainst),s.a.createElement("span",{className:"priority"}," ","Waiver Priority: ",t[8].waiverOrder))))))};t(5);var u=t(16),E=t.n(u);function d(){d=function(){return e};var e={},a=Object.prototype,t=a.hasOwnProperty,n=Object.defineProperty||function(e,a,t){e[a]=t.value},s="function"==typeof Symbol?Symbol:{},r=s.iterator||"@@iterator",l=s.asyncIterator||"@@asyncIterator",i=s.toStringTag||"@@toStringTag";function o(e,a,t){return Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}),e[a]}try{o({},"")}catch(O){o=function(e,a,t){return e[a]=t}}function c(e,a,t,s){var r=a&&a.prototype instanceof u?a:u,l=Object.create(r.prototype),i=new _(s||[]);return n(l,"_invoke",{value:k(e,t,i)}),l}function m(e,a,t){try{return{type:"normal",arg:e.call(a,t)}}catch(O){return{type:"throw",arg:O}}}e.wrap=c;var p={};function u(){}function E(){}function h(){}var v={};o(v,r,(function(){return this}));var f=Object.getPrototypeOf,g=f&&f(f(W([])));g&&g!==a&&t.call(g,r)&&(v=g);var N=h.prototype=u.prototype=Object.create(v);function w(e){["next","throw","return"].forEach((function(a){o(e,a,(function(e){return this._invoke(a,e)}))}))}function y(e,a){var s;n(this,"_invoke",{value:function(n,r){function l(){return new a((function(s,l){!function n(s,r,l,i){var o=m(e[s],e,r);if("throw"!==o.type){var c=o.arg,p=c.value;return p&&"object"==typeof p&&t.call(p,"__await")?a.resolve(p.__await).then((function(e){n("next",e,l,i)}),(function(e){n("throw",e,l,i)})):a.resolve(p).then((function(e){c.value=e,l(c)}),(function(e){return n("throw",e,l,i)}))}i(o.arg)}(n,r,s,l)}))}return s=s?s.then(l,l):l()}})}function k(e,a,t){var n="suspendedStart";return function(s,r){if("executing"===n)throw new Error("Generator is already running");if("completed"===n){if("throw"===s)throw r;return S()}for(t.method=s,t.arg=r;;){var l=t.delegate;if(l){var i=b(l,t);if(i){if(i===p)continue;return i}}if("next"===t.method)t.sent=t._sent=t.arg;else if("throw"===t.method){if("suspendedStart"===n)throw n="completed",t.arg;t.dispatchException(t.arg)}else"return"===t.method&&t.abrupt("return",t.arg);n="executing";var o=m(e,a,t);if("normal"===o.type){if(n=t.done?"completed":"suspendedYield",o.arg===p)continue;return{value:o.arg,done:t.done}}"throw"===o.type&&(n="completed",t.method="throw",t.arg=o.arg)}}}function b(e,a){var t=e.iterator[a.method];if(void 0===t){if(a.delegate=null,"throw"===a.method){if(e.iterator.return&&(a.method="return",a.arg=void 0,b(e,a),"throw"===a.method))return p;a.method="throw",a.arg=new TypeError("The iterator does not provide a 'throw' method")}return p}var n=m(t,e.iterator,a.arg);if("throw"===n.type)return a.method="throw",a.arg=n.arg,a.delegate=null,p;var s=n.arg;return s?s.done?(a[e.resultName]=s.value,a.next=e.nextLoc,"return"!==a.method&&(a.method="next",a.arg=void 0),a.delegate=null,p):s:(a.method="throw",a.arg=new TypeError("iterator result is not an object"),a.delegate=null,p)}function P(e){var a={tryLoc:e[0]};1 in e&&(a.catchLoc=e[1]),2 in e&&(a.finallyLoc=e[2],a.afterLoc=e[3]),this.tryEntries.push(a)}function x(e){var a=e.completion||{};a.type="normal",delete a.arg,e.completion=a}function _(e){this.tryEntries=[{tryLoc:"root"}],e.forEach(P,this),this.reset(!0)}function W(e){if(e){var a=e[r];if(a)return a.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var n=-1,s=function a(){for(;++n<e.length;)if(t.call(e,n))return a.value=e[n],a.done=!1,a;return a.value=void 0,a.done=!0,a};return s.next=s}}return{next:S}}function S(){return{value:void 0,done:!0}}return E.prototype=h,n(N,"constructor",{value:h,configurable:!0}),n(h,"constructor",{value:E,configurable:!0}),E.displayName=o(h,i,"GeneratorFunction"),e.isGeneratorFunction=function(e){var a="function"==typeof e&&e.constructor;return!!a&&(a===E||"GeneratorFunction"===(a.displayName||a.name))},e.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,h):(e.__proto__=h,o(e,i,"GeneratorFunction")),e.prototype=Object.create(N),e},e.awrap=function(e){return{__await:e}},w(y.prototype),o(y.prototype,l,(function(){return this})),e.AsyncIterator=y,e.async=function(a,t,n,s,r){void 0===r&&(r=Promise);var l=new y(c(a,t,n,s),r);return e.isGeneratorFunction(t)?l:l.next().then((function(e){return e.done?e.value:l.next()}))},w(N),o(N,i,"Generator"),o(N,r,(function(){return this})),o(N,"toString",(function(){return"[object Generator]"})),e.keys=function(e){var a=Object(e),t=[];for(var n in a)t.push(n);return t.reverse(),function e(){for(;t.length;){var n=t.pop();if(n in a)return e.value=n,e.done=!1,e}return e.done=!0,e}},e.values=W,_.prototype={constructor:_,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(x),!e)for(var a in this)"t"===a.charAt(0)&&t.call(this,a)&&!isNaN(+a.slice(1))&&(this[a]=void 0)},stop:function(){this.done=!0;var e=this.tryEntries[0].completion;if("throw"===e.type)throw e.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var a=this;function n(t,n){return l.type="throw",l.arg=e,a.next=t,n&&(a.method="next",a.arg=void 0),!!n}for(var s=this.tryEntries.length-1;s>=0;--s){var r=this.tryEntries[s],l=r.completion;if("root"===r.tryLoc)return n("end");if(r.tryLoc<=this.prev){var i=t.call(r,"catchLoc"),o=t.call(r,"finallyLoc");if(i&&o){if(this.prev<r.catchLoc)return n(r.catchLoc,!0);if(this.prev<r.finallyLoc)return n(r.finallyLoc)}else if(i){if(this.prev<r.catchLoc)return n(r.catchLoc,!0)}else{if(!o)throw new Error("try statement without catch or finally");if(this.prev<r.finallyLoc)return n(r.finallyLoc)}}}},abrupt:function(e,a){for(var n=this.tryEntries.length-1;n>=0;--n){var s=this.tryEntries[n];if(s.tryLoc<=this.prev&&t.call(s,"finallyLoc")&&this.prev<s.finallyLoc){var r=s;break}}r&&("break"===e||"continue"===e)&&r.tryLoc<=a&&a<=r.finallyLoc&&(r=null);var l=r?r.completion:{};return l.type=e,l.arg=a,r?(this.method="next",this.next=r.finallyLoc,p):this.complete(l)},complete:function(e,a){if("throw"===e.type)throw e.arg;return"break"===e.type||"continue"===e.type?this.next=e.arg:"return"===e.type?(this.rval=this.arg=e.arg,this.method="return",this.next="end"):"normal"===e.type&&a&&(this.next=a),p},finish:function(e){for(var a=this.tryEntries.length-1;a>=0;--a){var t=this.tryEntries[a];if(t.finallyLoc===e)return this.complete(t.completion,t.afterLoc),x(t),p}},catch:function(e){for(var a=this.tryEntries.length-1;a>=0;--a){var t=this.tryEntries[a];if(t.tryLoc===e){var n=t.completion;if("throw"===n.type){var s=n.arg;x(t)}return s}}throw new Error("illegal catch attempt")},delegateYield:function(e,a,t){return this.delegate={iterator:W(e),resultName:a,nextLoc:t},"next"===this.method&&(this.arg=void 0),p}},e}var h=function(e){var a=Object(n.useState)(""),t=Object(m.a)(a,2),r=t[0],l=t[1],i=Object(n.useState)(""),o=Object(m.a)(i,2),u=o[0],h=o[1],v=Object(n.useState)("loading"),f=Object(m.a)(v,2),g=f[0],N=f[1],w=["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a"];function y(){return(y=Object(c.a)(d().mark((function e(a){var t,n,s,r;return d().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return a&&a.preventDefault(),t="https://api.sleeper.app/v1/",e.next=4,fetch(t+"league/859880880154480640");case 4:return n=e.sent,e.next=7,n.json();case 7:if(!(s=e.sent)){e.next=12;break}return e.delegateYield(d().mark((function e(){var a,n,l,i,o,c,m,p,E,v,f;return d().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log(s),a=[],e.next=4,fetch(t+"league/859880880154480640/rosters");case 4:return n=e.sent,e.next=7,n.json();case 7:return l=e.sent,console.log("league rosters"),console.log(l),e.next=12,fetch(t+"league/859880880154480640/users");case 12:return i=e.sent,e.next=15,i.json();case 15:return o=e.sent,console.log("league users"),console.log(o),u.currentWeek-1,e.next=21,fetch(t+"league/859880880154480640/matchups/12");case 21:return c=e.sent,e.next=24,c.json();case 24:for(m=e.sent,console.log("league matchups"),console.log(m),p=[],l.map((function(e,a){return p.push({color:w[a],ownerID:e.owner_id,streak:e.metadata.streak,wins:e.settings.wins,losses:e.settings.losses,ties:e.settings.ties,roster_id:e.roster_id,moves:e.settings.total_moves,waiverOrder:e.settings.waiver_position,pointsFor:e.settings.fpts+"."+e.settings.fpts_decimal,pointsAgainst:e.settings.fpts_against+"."+e.settings.fpts_against_decimal,pointsPossible:e.settings.ppts+"."+e.settings.ppts_decimal,pointsPossiblePerc:(parseInt(e.settings.fpts+"."+e.settings.fpts_decimal)/parseInt(e.settings.ppts+"."+e.settings.ppts_decimal)*100).toFixed(2)})})),E=function(){var e=p[r].ownerID,t=o.filter((function(a){return a.user_id===e})),n=(a.filter((function(e){return e.rosterID===p[r].rosterID})),t[0].display_name),s=t[0].metadata.team_name||n;p[r].avatar=t[0].avatar,p[r].userName=n,p[r].teamName=s},r=0;r<p.length;r++)E();v=[],o.map((function(e){return v.push({avatar:e.metadata.avatar,username:e.display_name})})),f=[],m.map((function(e){return f.push({points:e.points,topScorer:e.starters_points[0]})})),h({name:s.name,season:s.season,avatar:s.avatar,size:s.total_rosters,currentWeek:s.settings.leg,waiverType:s.settings.waiver_type,waiverBudget:s.settings.waiver_budget,owners:p,teams:v,matchup:f}),N("loaded");case 37:case"end":return e.stop()}}),e)}))(),"t0",10);case 10:e.next=13;break;case 12:N("failed");case 13:case"end":return e.stop()}}),e)})))).apply(this,arguments)}return r||(l("859880880154480640"),function(e){y.apply(this,arguments)}(null,"859880880154480640")),s.a.createElement(s.a.Fragment,null,"loading"===g?s.a.createElement("div",{id:"loading",className:"full-screen"},s.a.createElement("div",{className:"inner"},s.a.createElement("div",{className:"loader"}))):"","failed"===g?s.a.createElement("div",{id:"failed",className:"full-screen"},s.a.createElement("div",{className:"inner"},s.a.createElement("span",{role:"img","aria-label":"",className:"emoji"},"\ud83e\udd14"),s.a.createElement("p",null,"League ID not working!"),s.a.createElement("p",null,"Your league ID: ",s.a.createElement("span",{className:"highlight"},r)))):"",s.a.createElement("header",null,s.a.createElement("div",{className:"inner"},s.a.createElement("div",{className:"top"},s.a.createElement("div",{className:"site-title"},u?s.a.createElement(s.a.Fragment,null,s.a.createElement("img",{className:"sleeper-logo",src:E.a}),s.a.createElement("h1",null,u.season," Power Rankings"),s.a.createElement("h3",null," ",u.name," - Week ",u.currentWeek),s.a.createElement("p",null)):"")))),s.a.createElement("main",null,s.a.createElement("div",{className:"row"},s.a.createElement("div",{className:"inner"},u?s.a.createElement(s.a.Fragment,null,s.a.createElement(p,{leagueData:u})):""))))};var v=function(e){return s.a.createElement(s.a.Fragment,null,s.a.createElement(h,null))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));var f=s.a.createElement(i.a,null,s.a.createElement("div",null,s.a.createElement(o.a,{exact:!0,path:"/",component:v}),s.a.createElement(o.a,{path:"/:id",component:h})));l.a.render(f,document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))}},[[19,1,2]]]);
//# sourceMappingURL=main.b15e93e8.chunk.js.map