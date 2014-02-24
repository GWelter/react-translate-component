var assert    = require('assert');
var React     = require('react');
var g11n      = require('globalization');
var Translate = require('./');
var render    = React.renderComponentToString;

g11n.registerTranslations('en', {
  test: {
    greeting: 'Hello, %(name)s!',
    greeting_html: 'Hello, <b>%(name)s</b>!'
  }
});

g11n.registerTranslations('de', {
  test: {
    greeting: 'Hallo %(name)s!',
    greeting_html: 'Hallo <b>%(name)s</b>!'
  }
});

// hack: suppress React console output
console.warn = function() {};

assert.matches = function(regexp, value, message) {
  if (!regexp.test(value)) {
    assert.fail(value, regexp, message, '=~');
  }
};

assert.doesNotMatch = function(regexp, value, message) {
  if (regexp.test(value)) {
    assert.fail(value, regexp, message, '!~');
  }
};

describe('The Translate component', function() {
  it('transfers props', function() {
    var props  = { component: React.DOM.h1, className: 'foo' };
    var markup = render(Translate(props, 'bar'));

    assert.matches(/^<h1 [^>]*?class="foo"/, markup);
  });

  it('properly translates stuff', function() {
    g11n.withLocale('en', function() {
      assert.matches(/Hello, <\/span><span[^>]*>Martin/, render(Translate({ name: 'Martin' }, 'test.greeting')));
      assert.matches(/Hello, <\/span><span[^>]*>Martin/, render(Translate({ name: 'Martin' }, ['test', 'greeting'])));

      assert.matches(/Hello, <b>Martin<\/b>!/, render(Translate({ name: 'Martin', unsafe: true }, 'test.greeting_html')));
      assert.matches(/Hello, <\/span><b[^>]*>Martin<\/b><span[^>]*>!/, render(Translate({ name: React.DOM.b(null, 'Martin') }, 'test.greeting')));

      var propsWithScope = { name: 'Martin', scope: ['test'] };

      assert.matches(/Hello, <\/span><span[^>]*>Martin/, render(Translate(propsWithScope, 'greeting')));
      assert.doesNotMatch(/\sscope="test"/, render(Translate(propsWithScope, 'greeting')));
    });
  });

  describe('with the `component` prop set to a "text-only" React component', function() {
    it('does not render HTML markup inside that component', function() {
      ['option', 'title', 'textarea'].forEach(function(tagName) {
        var props = { component: React.DOM[tagName], name: 'Martin' };
        var markup = render(Translate(props, 'test.greeting'));

        assert.matches(new RegExp('^<' + tagName + '[^>]*>[^<>]*<\/' + tagName + '>$'), markup);
      });
    });
  });

  describe('with the `locale` prop explicitly set', function() {
    it('disrespects the "global" locale', function() {
      var props = { locale: 'de', name: 'Martin', component: React.DOM.title };
      var markup = render(Translate(props, 'test.greeting'));

      g11n.withLocale('en', function() {
        assert.matches(/Hallo Martin!/, markup);
      });
    });
  });

  it('provides a globalization-inspired convenience method for building components', function() {
    var _t = Translate.translate;
    var component = _t('greeting', { scope: 'test', name: 'Martin', unsafe: true });

    assert(React.isValidComponent(component));

    g11n.withLocale('de', function() {
      var markup = render(component);
      assert.matches(/^<span[^>]*>Hallo Martin!<\/span>$/, markup);
      assert.doesNotMatch(/\sscope="test"/, markup);
    });
  });

  it('is cool', function() {
    assert(true);
  });
});
