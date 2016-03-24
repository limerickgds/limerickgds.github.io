import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browsersync from 'browser-sync';
import lazypipe from 'lazypipe';
import rimraf from 'rimraf';
import runSequence from 'run-sequence';
import config from './gulp-config.es6';
import child_process from 'child_process';
import stylish from 'jshint-stylish';

const $ = gulpLoadPlugins();

//启动本地serve
gulp.task('browsersync',['build'],() => {browsersync(config.browsersync.development);})

/**
 *  运行部分task，生成发布文件
 */

gulp.task('build', (cb) => {
    runSequence('delete',
    [
        'jekyll',
        'sass',
        'scripts',
        'images',
        // 'copy:fonts'
    ],
    // 'base64',
    cb);
});

/**
 * 删除 developmentAssets文件夹
 */
gulp.task('delete', (cb) => {
    rimraf(config.delete.src,cb);
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
 *  scss 转化为css
 */
gulp.task('sass',() => {
    let sassConfig = config.sass;
    sassConfig.options.onError = browsersync.notify;

    const filter = $.filter(['**/*.css','!**/*.map']);
    browsersync.notify('Compiling sass!');
    // 使用的是rubysass ,gem需要安装 sass，如果使用bundle install无法安装，直接使用gem安装
    return $.rubySass(sassConfig.src, sassConfig.options)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.autoprefixer(config.autoprefixer))
        .pipe(filter)
        .pipe($.sourcemaps.write('.',{ includeContent: false, sourceRoot: '_assets/css'}))
        .pipe(filter.restore())   //这里filter.restore要使用()，官网上的没有，会报错
        .pipe(gulp.dest(sassConfig.dest));
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
  *  watch
  */
gulp.task('watch', ['browsersync'], function() {
    gulp.watch(config.watch.jekyll,  ['jekyll-rebuild']);
    gulp.watch(config.watch.sass,    ['sass', 'scsslint']);
    gulp.watch(config.watch.scripts, ['scripts', 'jshint']);
    gulp.watch(config.watch.images,  ['images']);
});

/**
 * Lint SCSS 文件
 */
gulp.task('scsslint', () => {
    let scssConfig = config.scsslint;
    return gulp.src(scssConfig.src)
        .pipe($.scsslint(scssConfig.options));
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
 * es6转化为es5
 */
gulp.task('scripts', (done) =>{
    let babelConfig = config.scripts.babel;
    return gulp.src(babelConfig.src)
        .pipe($.babel(babelConfig.options))
        .pipe($.rename({extname: '.es5.js'}))
        .pipe(gulp.dest(babelConfig.dest))
        .on('close',done);
});
