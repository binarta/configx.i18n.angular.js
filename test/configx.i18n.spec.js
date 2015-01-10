angular.module('config', [])
    .factory('config', function() {return {namespace:'n'}});
angular.module('i18n.gateways', [])
    .factory('i18nMessageReader', function() {
        return jasmine.createSpy('i18nMessageReaderSpy');
    })
    .factory('i18nMessageWriter', function() {
        return jasmine.createSpy('i18nMessageWriterSpy');
    });

describe('configx.i18n.js', function() {
    var query, output, provider;

    beforeEach(module('configx.i18n'));
    beforeEach(inject(function(i18nMessageReader, i18nMessageWriter) {
        query = i18nMessageReader;
        output = i18nMessageWriter;
    }));

    describe('given config value reader', function() {
        var reader, writer, value, request, response;

        beforeEach(inject(function(publicConfigReader, publicConfigWriter) {
            reader = publicConfigReader;
            writer = publicConfigWriter;
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
                reader(request, response);
            });

            it('delegates to i18n query channel', function() {
                expect(query.calls[0].args[0]).toEqual({
                    namespace:'n',
                    code:'x',
                    locale:'default'
                });
            });

            it('known values', function() {
                query.calls[0].args[1]('a');
                expect(value).toEqual('a');
            });

            it('unknown values', function() {
                query.calls[0].args[1]('???x???');
                expect(value).toEqual('not found');
            });

            it('read error', function() {
                query.calls[0].args[2]('read error');
                expect(value).toEqual('read error');
            });
        });

        describe('writing', function() {
            beforeEach(function() {
                request = {
                    key:'x',
                    value:'a'
                };
                response = 'response';
                writer(request, response);
            });

            it('delegates to i18n output channel', function() {
                expect(output.calls[0].args[0]).toEqual({key:'x', message:'a'});
            });

            it('write accepted', function() {
                expect(output.calls[0].args[1]).toEqual(response);
            });
        });
    });
});

