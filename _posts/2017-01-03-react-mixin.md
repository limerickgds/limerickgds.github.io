---
layout: default
title: reactjs mixin介绍
keywords: react,mixin,react component
excerpt_separator: <!--more-->
---

在使用 createClass 创建 react 组件中，大家都应该了解有一个属性 mixins（混入）。在项目开发过程中，我们会常常遇到一些功能被多个组件共用，这时候就需要考虑使用 mixin。那 mixin 到底是怎么是什么，我们该怎么使用它，es6如何使用 mixin ？这篇文章就做一个简单的介绍。

<!--more-->

### mixin 的由来

在面向对象的语言中，c++ 等实现了多重继承，但多重继承带来了结构复杂，二义性等问题，为了解决这样的问题，一些面向对象语言 java 和 c# 都是以单继承 + 接口的方式来实现面向对象。但是常常会遇到一个类实现了多个接口，而很多接口都是公用的。当然可以对一些接口用抽象类共用，但是就会带来继承的复杂度。为了解决这样的问题，lisp，ruby等引入了 mixin。（sass,less也有 mixin ）而很多动态语言可以很简单的实现一个 mixin， 比如 JavaScript。 但是如果把它定义为多重继承的一种实现，我更愿意称它为一种组合的方式。

### 如何使用 react mixin
1.首先我们先定义一个简单的 mixin，它的作用就是在每个组件装载之后向后台发送一个http请求，实现如下：

```js
var InitStateMixin = {
  componentDidMount: function () {
    fetch(this.props.initUrl).then(function(res){
      return res.json();
    }).then(function(json){
      console.log('init',json);
    }).catch(function(ex) {
      console.log(ex);
    })
  }
};
```

2.加入到 react 组件中。想要在 react 组件中使用 mixin ，首先需要使用 react.createClass 来创建组件并加入 mixins 属性。使用 ES6 的方式创建组件，暂时没有提供这个功能，ES6 该如何使用稍候再讲。我们看下边这个例子：

```js
var App = React.createClass({
  mixins: [InitStateMixin],
  getDefaultProps: function() {
    return {
      initUrl: './home.json'
    };
  },
  render: function() {
    return (
      <div>Hello, world!</div>
    );
  }
});
```


### react mixin 实现
具体到 react 组件内部，我们知道 react 有自己定义的生命周期钩子函数；有defaultprops，render等方法；还有如果面对 mixins 了多个相同名字的方法该如何处理？我们接下来看一段 react mixin 代码：

```js
function mixSpecIntoComponent(Constructor, spec) {
  // ...

  var proto = Constructor.prototype;
  var autoBindPairs = proto.__reactAutoBindPairs;

  if (spec.hasOwnProperty(MIXINS_KEY)) {  // 如果包含属性名为 mixins 的，将其 mixin 入组件
    RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);
  }

  for (var name in spec) {
    if (!spec.hasOwnProperty(name)) { // 非自身属性不会 mixin
      continue;
    }

    if (name === MIXINS_KEY) {   // 如果属性名为 mixins，跳过
      continue;
    }

    var property = spec[name];
    var isAlreadyDefined = proto.hasOwnProperty(name);
    validateMethodOverride(isAlreadyDefined, name);

    if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
      RESERVED_SPEC_KEYS[name](Constructor, property);
    } else {
      // 根据定义 react component 中不同方法的类型来对其做不同的处理
      var isReactClassMethod = ReactClassInterface.hasOwnProperty(name);
      var isFunction = typeof property === 'function';
      var shouldAutoBind = isFunction && !isReactClassMethod && !isAlreadyDefined && spec.autobind !== false;

      if (shouldAutoBind) {
        autoBindPairs.push(name, property);
        proto[name] = property;       // 绑定到prototype上
      } else {
        if (isAlreadyDefined) {
          var specPolicy = ReactClassInterface[name];

          // 如果不属于react class 的方法，或者属于但类型不是 'DEFINE_MANY_MERGED' 和 'DEFINE_MANY' 的将抛出异常
          !(isReactClassMethod && (specPolicy === 'DEFINE_MANY_MERGED' || specPolicy === 'DEFINE_MANY')) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactClass: Unexpected spec policy %s for key %s when mixing in component specs.', specPolicy, name) : _prodInvariant('77', specPolicy, name) : void 0;

          // 属于'DEFINE_MANY_MERGED'类型的将其结果进行merge
          // 属于'DEFINE_MANY'类型的进行链接
          if (specPolicy === 'DEFINE_MANY_MERGED') {
            proto[name] = createMergedResultFunction(proto[name], property);
          } else if (specPolicy === 'DEFINE_MANY') {
            proto[name] = createChainedFunction(proto[name], property);
          }
        } else {
          proto[name] = property;
          //...
        }
      }
    }
  }
}
```
> //... 省略部分代码

ReactClassInterface 定义的类型主要分成以下几类：

1. **DEFINE_MANY**：定义多次，包括：mixins,statics,propTypes,contextTypes,childContextTypes,componentWillMount,componentDidMount,componentWillReceiveProps,componentWillUpdate,componentDidUpdate,componentWillUnmount;
2. **DEFINE_MANY_MERGED**: 定义多次采用merge方式，包括：getDefaultProps,getInitialState,getChildContext;
3. **DEFINE_ONCE**: 定义一次，包括：render, shouldComponentUpdate;
4. **OVERRIDE_BASE**: 重写，包括：updateComponent;

从以上代码，我们可以大概将 createClass 的 mixin 如何处理我们混入的模块方法分为以下几类：

- **模块普通方法：** 这是 mixin 最基本的功能， 将我们定义的 mixin 模块中的方法合并到 component 中，合并过程有个原则：
   - 当方法名存在冲突，抛出异常。
- **多个生命周期方法（不包括 shouldComponentUpdate ）：** 我们可以在 mixin 模块中定义生命周期方法，混入到 Component 中。当存在重复时，它会按照以下规则调用：
   - 先调用 mixins 中的生命周期方法，然后调用组件的生命周期方法。
   - mixins 中相同的声明周期方法，从左到右依次调用。
- **其它 react class 方法：** 这些 component 内部方法的处理比较特殊，主要分成以下几种：
   1. **两个返回的结果进行合并**，当结果中存在属性名冲突时，会报错，包括：getDefaultProps,getInitialState,getChildContext;
   2. **这个只允许定义一次：**如果重复定义，就会抛出异常，需要注意的是，唯一一次定义并没有限定 mixin 不能定义，包括：render, shouldComponentUpdate, updateComponent;
   3. **assign：**将其进行 assign,参照 Object.assign; 包括：childContextTypes,childContextTypes,propTypes;
   4. **设置为最后一次定义：**直接设置为最后一次定义的值，如：displayName;
   5. **mixins**：将其继续混入 component 中;
   6. **statics合并：** 将 statics 中定义的属性设置为 component 的静态方法，如果有重名冲突，抛出异常;

> react mixins 是从左往右一次进行 mixin

可以查看[相关代码示例](http://plnkr.co/edit/QtBjZOXXdNI5NITQKcsi?p=preview)

### ES6 怎么使用 mixin？

由于 react 从0.14后不再推荐使用 mixin，所以并没有直接提供一些方法，让 ES6 class 创建的组件可以使用 mixin，但是我们可以用其它方式来实现类似的功能。

#### Higher-Order Components(HOCs)
Higher-Order Components顾名思义就是高级组件。在js中，我们就常常用到高阶组件，它也是函数式编程的基本概念。它的意思就是传入一个函数或者输出一个函数。所以对于高阶组件也就很容易理解，就是把函数换成组件。我们可以看一个例子：

```js
import React, { Component } from 'React';

const PageContainer = (Home) =>
  class HomeComponent extends Component {

    componentDidMount() {
      console.log('PageContainer did mount')
    }

    render() {
      return <Home {...this.props} />;
    }
  } 
```

#### decorator
我们可以使用 ES7 的 decorator,将 mixins 中各个模块的属性和方法定义到 component prototype 上。具体例子如：[core-decorators 的 mixin](https://github.com/jayphelps/core-decorators.js/blob/master/src/mixin.js)

> 但是以上两种方式都和 createClass 的 mixin 实现并不完全相同。当然，如果你想完全保持一致，也可以自己编写一个 mixin

### 总结
不论是使用 createClass 的 mixin 方式，还是使用 ES6 的高阶组件，抑或是使用继承等等哪种方式。我们最终要达到的目的还是要实现更好的抽象，隔离复杂度，避免代码的重复，同时保持代码的友好性。



