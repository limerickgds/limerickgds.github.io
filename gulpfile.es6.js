import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browsersync from 'browser-sync';
import lazypipe from 'lazypipe';
import runSequence from 'run-sequence';
import config from './gulp-config.es6';
import child_process from 'child_process';
import stylish from 'jshint-stylish';

const $ = gulpLoadPlugins();

//启动本地serve
gulp.task('browsersync',['serve'],() => {browsersync(config.browsersync.development);});

/**
 *  运行部分task，生成调试文件
 */

gulp.task('serve', (cb) => {
    runSequence('clean',
    [
        'jekyll',
        'styles',
        'sass',
        'scripts',
        'images',
        'fonts'
    ],
    // 'base64',
    cb);
});

/**
 * 将assets生成的文件，拷贝到_assets中 暂时去掉
 */

// gulp.task('build', ['serve'], (cb) => {
//     return gulp.src(config.build.src)
//         .pipe(gulp.dest(config.build.dest))
//         .on('close',cb);
//  });


/**
 * 删除 developmentAssets文件夹
 */
gulp.task('clean', (cb) => {
    return gulp.src(config.clean.src)
        .pipe($.clean())
        .on('close',cb);;
});


/**
 * jekyll 设置
 */
gulp.task('jekyll', (done) => {
    browsersync.notify('Compiling jekyll!');
    let jekyllConfig = config.jekyll.development;
    return child_process.spawn('bundle', ['exec', 'jekyll', 'build', '-q', '--source='+jekyllConfig.src, '--destination=' + jekyllConfig.dest, '--config=' + jekyllConfig.config], { stdio: 'inherit'})
    .on('close', done);
});

gulp.task('jekyll-rebuild',['jekyll'], () => {
    browsersync.reload();
});

/**
 * images
 */
gulp.task('images', () => {
    let imagesConfig = config.images;
    return gulp.src(imagesConfig.src)
         .pipe(gulp.dest(imagesConfig.dest));
});

/**
 * fonts
 */
gulp.task('fonts', () => {
    let fontsConfig = config.fonts;
    return gulp.src(fontsConfig.src)
        .pipe(gulp.dest(fontsConfig.dest));
})


 /**
  *  watch
  */
gulp.task('watch', ['browsersync'], function() {
    gulp.watch(config.watch.jekyll,  ['jekyll-rebuild']);
    gulp.watch(config.watch.sass,    ['sass', 'scsslint']);
    gulp.watch(config.watch.scripts, ['scripts', 'jshint']);
    gulp.watch(config.watch.images,  ['images']);
});

/**
 * 将styles中的css文件压缩复制，已压缩文件直接复制
 */
gulp.task('styles', () => {
    let stylesConfig = config.styles;
    const filter = $.filter(['*.css','!*.min.css'],{restore: true});

    return gulp.src(stylesConfig.src)
        .pipe($.sourcemaps.init())
        .pipe(filter)
        .pipe($.minifyCss({keepSpecialComments : 0}))
        .pipe($.rename({extname: '.min.css'}))
        .pipe($.sourcemaps.write('.',{ includeContent: false, sourceRoot: '_assets/styles'}))
        .pipe(filter.restore())
        .pipe(gulp.dest(stylesConfig.dest));
});

/**
 *  scss 转化为css ，并且声称map文件，进行压缩
 */
gulp.task('sass',() => {
    let sassConfig = config.sass;
    sassConfig.options.onError = browsersync.notify;

    const filter = $.filter(['**/*.css','!**/*.map'],{restore: true});
    browsersync.notify('Compiling sass!');
    // 使用的是rubysass ,gem需要安装 sass，如果使用bundle install无法安装，直接使用gem安装
    return $.rubySass(sassConfig.src, sassConfig.options)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.autoprefixer(config.autoprefixer))
        .pipe(filter)
        .pipe($.minifyCss({keepSpecialComments : 0}))
        .pipe($.rename({extname: '.min.css'}))
        .pipe($.sourcemaps.write('.',{ includeContent: false, sourceRoot: '_assets/styles'}))
        .pipe(filter.restore())   //这里filter.restore要使用()，官网上的没有，会报错
        .pipe(gulp.dest(sassConfig.dest));
});

/**
 * Lint SCSS 文件 检查
 */
gulp.task('scsslint', () => {
    let scssConfig = config.scsslint;
    return gulp.src(scssConfig.src)
        .pipe($.scssLint(scssConfig.options));
});

/**
 * 检查js语法
 */
gulp.task('jshint', () => {
    let jshintConfig = config.jshint;
    return gulp.src(jshintConfig.src)
        .pipe($.jshint('.jshintrc'))
        .pipe($.jshint.reporter(stylish));
});

/**
 * es6转化为es5,并进行压缩
 */
gulp.task('scripts', (done) =>{
    let babelConfig = config.scripts.babel;
    return gulp.src(babelConfig.src)
        .pipe($.babel(babelConfig.options))
        .pipe($.uglify())
        .pipe($.rename({extname: '.min.js'}))
        .pipe(gulp.dest(babelConfig.dest))
        .on('close',done);
});
