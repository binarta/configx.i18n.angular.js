angular.module('config.gateways', ['i18n.gateways', 'config'])
    .factory('publicConfigReader', ['i18nMessageReader', 'config', '$q', PublicConfigReaderFactory])
    .factory('publicConfigWriter', ['i18nMessageWriter', 'configWriter', PublicConfigWriterFactory]);

function PublicConfigReaderFactory(reader, config, $q) {
    return function (request, response) {
        var deferred = $q.defer();

        reader({namespace:config.namespace, code:request.key, locale:'default'}, function (it) {
            it == '???' + request.key + '???' ? onReject() : onSuccess(it);
        }, response.error);

        function onSuccess(it) {
            response.success(it);
            deferred.resolve(it);
        }

        function onReject() {
            response.notFound();
            deferred.reject();
        }

        return deferred.promise;
    };
}

function PublicConfigWriterFactory(writer, configWriter) {
    return function(request, response) {
        writer({key:request.key, message:request.value}, response);

        return configWriter({
            $scope:{},
            key:request.key,
            value: request.value,
            scope: 'public'
        });
    }
}