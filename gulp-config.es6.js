const app               = '.';
const bower             = './bower_components';
const src               = './src';
const development       = './.dev';  //调试环境Jekyll生成的文件目录
const srcAssets         = './src/assets';    // 调试环境 assets
const assets            = './assets';     // blog  assets 目录

var config = {
    autoprefixer: {
        browsers: [
            'last 2 version',
            'safari 5',
            'ie 7',
            'ie 8',
            'ie 9',
            'ios 6',
            'android 4'
        ],
        cascade: true
    },
    browsersync: {
        server: {
            baseDir: [
                development
            ]
        },
        port: 9999,
        ui: {
            port: 9998
        }
            // files: [
            //     assets + '/styles/*.css',
            //     assets + '/scripts/*.js',
            //     assets + '/images/**',
            //     assets + '/fonts/*'
            // ]
    },
    clean: {
        dev: development,
        build: assets
    },
    fonts: {
        src: srcAssets + '/fonts/*',
        dest: {
          dev: development + '/assets/fonts',
          build: assets + '/fonts'
        }
    },
    images: {
        src:  srcAssets + '/images/**/*',
        dest: {
          dev: development + '/assets/images',
          build: assets + '/images'
        }
    },
    jekyll: {
        src: app,
        dest: development,
        config: './_config.yml'
    },
    jshint: {
        src: srcAssets + '/scripts/*.js'
    },
    scripts: {
        babel: {
            src: srcAssets + '/scripts/**/*.js',
            dest: {
              dev: development + '/assets/scripts',
              build: assets + '/scripts'
            },
            options: {
                presets: ['es2015']
            }
        }
    },
    styles: {
        src: srcAssets + '/styles/*.css',
        dest: {
          dev: development + '/assets/styles',
          build: assets + '/styles'
        }
    },
    scsslint: {
        src: [
            srcAssets + '/styles/**/*.{sass,scss}'
        ],
        options: {
        }
    },
    sass: {
        src: srcAssets + '/styles/*.{scss,sass}',
        dest: {
          dev: development + '/assets/styles',
          build: assets + '/styles'
        },
        options: {
            noCache: true,
            compass: false,
            bundleExec: true,
            sourcemap: true
        }
    },
    watch: {
        jekyll: [
            './_config.yml',
            app + '/_data/**/*.{json,yml,csv}',
            app + '/_includes/**/*.{html,xml}',
            app + '/_layouts/*.html',
            app + '/_posts/*.{markdown,md}',
            app + '/*.{html,markdown,md,yml,json,txt,xml}',
        ],
        sass:    srcAssets + '/styles/**/*.{sass,scss}',
        scripts: srcAssets + '/scripts/**/*.js',
        images:  srcAssets + '/images/**/*'
    }
};

export default config;
