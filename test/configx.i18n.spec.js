angular.module('config', [])
    .factory('config', function() {return {namespace:'n'}})
    .factory('configWriter', function () {
        return jasmine.createSpy('configWriter');
    });

angular.module('i18n.gateways', [])
    .factory('i18nMessageReader', function() {
        return jasmine.createSpy('i18nMessageReaderSpy');
    })
    .factory('i18nMessageWriter', function() {
        return jasmine.createSpy('i18nMessageWriterSpy');
    });

describe('configx.i18n.js', function() {
    var query, output, provider;

    beforeEach(module('config.gateways'));
    beforeEach(inject(function(i18nMessageReader, i18nMessageWriter) {
        query = i18nMessageReader;
        output = i18nMessageWriter;
    }));

    describe('given config value reader', function() {
        var reader, writer, value, request, response, configWriter, $rootScope;

        beforeEach(inject(function(publicConfigReader, publicConfigWriter, _configWriter_, _$rootScope_) {
            reader = publicConfigReader;
            writer = publicConfigWriter;
            configWriter = _configWriter_;
            $rootScope = _$rootScope_;
        }));

        describe('reading', function() {
            beforeEach(function() {
                request = {
                    key:'x'
                };
                response = {
                    success:function(it) {value = it},
                    notFound:function() {value = 'not found'},
                    error:function(it) {value = it}
                };
            });

            it('delegates to i18n query channel', function() {
                reader(request, response);

                expect(query.calls[0].args[0]).toEqual({
                    namespace:'n',
                    code:'x',
                    locale:'default'
                });
            });

            it('known values', function() {
                reader(request, response);
                query.calls[0].args[1]('a');

                expect(value).toEqual('a');
            });

            it('unknown values', function() {
                reader(request, response);
                query.calls[0].args[1]('???x???');

                expect(value).toEqual('not found');
            });

            it('read error', function() {
                reader(request, response).then(function () {}, function (data) {
                    expect(data).toEqual('read error');
                });
                query.calls[0].args[2]('read error');

                $rootScope.$digest();

                expect(value).toEqual('read error');
            });

            it('returns a promise', function () {
                var value;
                reader(request, response).then(function (v) {
                    value = v;
                });
                query.calls[0].args[1]('a');
                $rootScope.$digest();

                expect(value.data.value).toEqual('a');
            });
        });

        describe('writing', function() {
            beforeEach(function() {
                request = {
                    key:'x',
                    value:'a'
                };
                response = 'response';
            });

            it('delegates to i18n output channel', function() {
                writer(request, response);

                expect(output.calls[0].args[0]).toEqual({key:'x', message:'a', locale:'default'});
            });

            it('write accepted', function() {
                writer(request, response);

                expect(output.calls[0].args[1]).toEqual(response);
            });

            it('delegates to configWriter', function () {
                writer(request, response);

                expect(configWriter.calls[0].args[0].$scope).toEqual({});
                expect(configWriter.calls[0].args[0].key).toEqual('x');
                expect(configWriter.calls[0].args[0].value).toEqual('a');
                expect(configWriter.calls[0].args[0].scope).toEqual('public');
            });

            it('returns a promise', function () {
                configWriter.andReturn({success: function () {}});

                writer(request, response).success();
            });
        });
    });
});

