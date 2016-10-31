import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import gifsicle from 'imagemin-gifsicle';
import pngquant from 'imagemin-pngquant';
import jpegtran from 'imagemin-jpegtran';
import browsersync from 'browser-sync';
import lazypipe from 'lazypipe';
import runSequence from 'run-sequence';
import config from './gulp-config.es6';
import child_process from 'child_process';
import stylish from 'jshint-stylish';

const $ = gulpLoadPlugins();

//启动本地serve
gulp.task('browsersync', () => {
    browsersync(config.browsersync);
});



/**
 * 删除 _assets文件
 */
gulp.task('clean', (cb) => {
    return gulp.src(config.clean.build)
        .pipe($.clean())
        .on('close', cb);;
});

/**
 * 删除 development文件夹
 */
gulp.task('clean:dev', (cb) => {
    return gulp.src(config.clean.dev)
        .pipe($.clean())
        .on('close', cb);;
});

/**
 * jekyll 设置
 */
gulp.task('jekyll', (done) => {
    browsersync.notify('Compiling jekyll!');
    let jekyllConfig = config.jekyll;
    return child_process.spawn('bundle', ['exec', 'jekyll', 'build', '-q', '--source=' + jekyllConfig.src, '--destination=' + jekyllConfig.dest, '--config=' + jekyllConfig.config], { stdio: 'inherit' })
        .on('close', done);
});

gulp.task('jekyll:rebuild', ['jekyll'], () => {
    browsersync.reload();
});

/**
 * images
 */
gulp.task('images', () => {
    let imagesConfig = config.images;
    return gulp.src(imagesConfig.src)
        .pipe($.imagemin(
            [   gifsicle({interlaced: true}),
                jpegtran({ progressive: true }),
                pngquant()
            ], {
                optimizationLevel: 5,
                verbose: true 
            }
        ))
        .pipe(gulp.dest(imagesConfig.dest.build));
});
/**
 * images:dev
 */
gulp.task('images:dev', () => {
    let imagesConfig = config.images;
    return gulp.src(imagesConfig.src)
        .pipe(gulp.dest(imagesConfig.dest.dev));
});
/**
 * fonts
 */
gulp.task('fonts', () => {
    let fontsConfig = config.fonts;
    return gulp.src(fontsConfig.src)
        .pipe(gulp.dest(fontsConfig.dest.build));
})

/**
 * fonts:dev
 */
gulp.task('fonts:dev', () => {
    let fontsConfig = config.fonts;
    return gulp.src(fontsConfig.src)
        .pipe(gulp.dest(fontsConfig.dest.dev));
})

/**
 * 将styles中的css文件压缩复制，已压缩文件直接复制
 */
gulp.task('styles', () => {
    let stylesConfig = config.styles;
    const filter = $.filter(['*.css', '!*.min.css'], { restore: true });

    return gulp.src(stylesConfig.src)
        .pipe($.sourcemaps.init())
        .pipe(filter)
        .pipe($.cleanCss({ keepSpecialComments: 0 }))
        .pipe($.rename({ extname: '.min.css' }))
        .pipe($.sourcemaps.write('.', { includeContent: false, sourceRoot: '_assets/styles' }))
        .pipe(filter.restore())
        .pipe(gulp.dest(stylesConfig.dest.build));
});

/**
 * styles:dev
 */
gulp.task('styles:dev', () => {
    let stylesConfig = config.styles;
    const filter = $.filter(['*.css', '!*.min.css'], { restore: true });

    return gulp.src(stylesConfig.src)
        .pipe(filter)
        .pipe($.rename({ extname: '.min.css' }))
        .pipe(filter.restore())
        .pipe(gulp.dest(stylesConfig.dest.dev));
});

/**
 *  scss 转化为css ，并且声称map文件，进行压缩
 */
gulp.task('sass', () => {
    let sassConfig = config.sass;
    sassConfig.options.onError = browsersync.notify;

    const filter = $.filter(['**/*.css', '!**/*.map'], { restore: true });
    browsersync.notify('Compiling sass!');
    // 使用的是rubysass ,gem需要安装 sass，如果使用bundle install无法安装，直接使用gem安装
    return $.rubySass(sassConfig.src, sassConfig.options)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.autoprefixer(config.autoprefixer))
        .pipe(filter)
        .pipe($.cleanCss({ keepSpecialComments: 0 }))
        .pipe($.rename({ extname: '.min.css' }))
        .pipe($.sourcemaps.write('.', { includeContent: false }))
        .pipe(filter.restore())   //这里filter.restore要使用()，官网上的没有，会报错
        .pipe(gulp.dest(sassConfig.dest.build));
});

/**
 *  scss 转化为css ，并且声称map文件，进行压缩
 */
gulp.task('sass:dev', () => {
    let sassConfig = config.sass;
    sassConfig.options.onError = browsersync.notify;

    const filter = $.filter(['**/*.css', '!**/*.map'], { restore: true });
    browsersync.notify('Compiling sass!');
    // 使用的是rubysass ,gem需要安装 sass，如果使用bundle install无法安装，直接使用gem安装
    return $.rubySass(sassConfig.src, sassConfig.options)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.autoprefixer(config.autoprefixer))
        .pipe(filter)
        .pipe($.rename({ extname: '.min.css' }))
        .pipe($.sourcemaps.write('.', { includeContent: false }))
        .pipe(filter.restore())   //这里filter.restore要使用()，官网上的没有，会报错
        .pipe(gulp.dest(sassConfig.dest.dev));
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
gulp.task('scripts', (done) => {
    let babelConfig = config.scripts.babel;
    return gulp.src(babelConfig.src)
        .pipe($.babel(babelConfig.options))
        .pipe($.uglify())
        .pipe($.rename({ extname: '.min.js' }))
        .pipe(gulp.dest(babelConfig.dest.build))
        .on('close', done);
});

/**
 * es6转化为es5,并进行压缩
 */
gulp.task('scripts:dev', (done) => {
    let babelConfig = config.scripts.babel;
    return gulp.src(babelConfig.src)
        .pipe($.babel(babelConfig.options))
        .pipe($.uglify())
        .pipe($.rename({ extname: '.min.js' }))
        .pipe(gulp.dest(babelConfig.dest.dev))
        .on('close', done);
});


/**
 *  watch
 */
gulp.task('watch', () => {
    gulp.watch(config.watch.jekyll, ['jekyll:rebuild']);
    gulp.watch(config.watch.sass, ['sass:dev', 'scsslint']);
    gulp.watch(config.watch.scripts, ['scripts:dev', 'jshint']);
    gulp.watch(config.watch.images, ['images:dev']);
});

/**
 *  运行部分task，生成调试文件
 */

gulp.task('dev', (cb) => {
    runSequence('clean:dev',
        [
            'jekyll',
            'styles:dev',
            'sass:dev',
            'scripts:dev',
            'images:dev',
            'fonts:dev'
        ],
        'browsersync',
        'watch',
        // 'base64',
        cb);
});

gulp.task('build', (cb) => {
    runSequence('clean',
        [
            'styles',
            'sass',
            'scripts',
            'images',
            'fonts'
        ],
        // 'base64',
        cb);
});
