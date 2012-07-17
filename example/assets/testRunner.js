(function (window) {
    "use strict";

    var nof5 = window.nof5,
        mocha = window.mocha;

    jQuery(function onDomReady() {

        nof5.socket.on("connect", function onConnect() {

            jQuery("#mocha").empty();

            mocha.setup({
                ui:"bdd",
                globals: ["io", "getInterface"] //getInterface seems to a global function from mocha ^^
            });

            mocha.Runner.prototype.on("suite", function (suite) {
                if(suite.root) {
                    nof5.socket.emit("start", new Date());
                }
            });

            mocha.Runner.prototype.on("fail", function onFail(test) {

                console.log("fail");

                mocha.Runner.prototype.once("test end", function onTestEnd() {

                    console.log("test end");

                    var error = {
                        "suite": test.parent.title,
                        "test": test.title,
                        "type": test.err.toString()
                    };

                    nof5.socket.emit("fail", error);
                });
            });

            mocha.Runner.prototype.on("suite end", function onSuiteEnd(suite) {
                if (suite.root) {
                    nof5.socket.emit("end", new Date());
                }
            });

            nof5.enableTests();
            mocha.run();

            function onf5() {

                var oldTests = jQuery("script[src='tests.js']");

                if (oldTests.length !== 0) {
                    jQuery("script[src='tests.js']").remove();
                }

                jQuery.getScript("tests.js", function onTestsLoaded() {

                    jQuery("#mocha").empty();

                    nof5.enableTests();
                    mocha.run();

                    nof5.socket.once("f5", onf5);

                });
            }


            nof5.socket.once("f5", onf5);
        });
    });

})(window);
