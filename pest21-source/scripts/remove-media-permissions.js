#!/usr/bin/env node
// Hook to remove unused media/record audio permissions if required by after_prepare
module.exports = function(context) {
    console.log('[Hook] Executing remove-media-permissions after_prepare hook');
};
