angular.module('configx.i18n', ['i18n.gateways', 'config'])
    .factory('publicConfigReader', ['i18nMessageReader', 'config', PublicConfigReaderFactory])
    .factory('publicConfigWriter', ['i18nMessageWriter', 'configWriter', PublicConfigWriterFactory]);

function PublicConfigReaderFactory(reader, config) {
    return function (request, response) {
        reader({namespace:config.namespace, code:request.key, locale:'default'}, function (it) {
            it == '???' + request.key + '???' ? response.notFound() : response.success(it);
        }, response.error);
    };
}

function PublicConfigWriterFactory(writer, configWriter) {
    return function(request, response) {
        writer({key:request.key, message:request.value}, response);

        configWriter({
            $scope:{},
            key:request.key,
            value: request.value,
            scope: 'public'
        });
    }
}