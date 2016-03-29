const app               = '.';
const bower             = './bower_components';
const src               = './src';
const development       = './src/development';  //调试环境Jekyll生成的文件目录
const developmentAssets = './assets';    // 调试环境 assets
const assets            = './src/_assets';     // blog  assets 目录
const buildAssets       = './_assets';

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
        development: {
            server: {
                baseDir: [
                    development,
                    src
                ]
            },
            port: 9999,
            files: [
                assets + '/styles/*.css',
                assets + '/scripts/*.js',
                assets + '/images/**',
                assets + '/fonts/*'
            ]
        },
        build: {

        }
    },
    clean: {
        src: [development, assets]
    },
    fonts: {
        src: developmentAssets + '/fonts/*',
        dest: assets + '/fonts'
    },
    images: {
        src:  developmentAssets + '/images/**/*',
        dest: assets + '/images'
    },
    jekyll: {
        development: {
            src: app,
            dest: development,
            config: './_config.yml'
       }
    },
    jshint: {
        src: developmentAssets + '/scripts/*.js'
    },
    scripts: {
        babel: {
            src: developmentAssets + '/scripts/**/*.js',
            dest: assets + '/scripts',
            options: {
                presets: ['es2015']
            }
        }
    },
    styles: {
        src: developmentAssets + '/styles/*.css',
        dest:  assets + '/styles',
    },
    scsslint: {
        src: [
            developmentAssets + '/styles/**/*.{sass,scss}'
        ],
        options: {
        }
    },
    sass: {
        src: developmentAssets + '/styles/*.{scss,sass}',
        dest:  assets + '/styles',
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
        sass:    developmentAssets + '/styles/**/*.{sass,scss}',
        scripts: developmentAssets + '/scripts/**/*.js',
        images:  developmentAssets + '/images/**/*'
    },
    build: {
        src: assets,
        dest: buildAssets
    }
};

export default config;
