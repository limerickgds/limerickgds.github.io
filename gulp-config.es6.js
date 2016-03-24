const app               = '.';
const development       = './src/development';  //调试环境Jekyll生成的文件目录
const srcAssets         = './_assets';     // blog  assets 目录
const developmentAssets = './src/assets';    // 调试环境 assets

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
                    srcAssets
                ]
            },
            port: 9999,
            files: [
                developmentAssets + '/css/*.css',
                developmentAssets + '/js/*.js',
                developmentAssets + '/images/**',
                developmentAssets + '/fonts/*'
            ]
        }
    },
    delete: {
        src: developmentAssets
    },
    images: {
        src:  srcAssets + '/images/**/*',
        dest: developmentAssets + '/images'
    },
    jekyll: {
        development: {
            src: app,
            dest: development,
            config: './_config.yml'
       }
    },
    jshint: {
        src: srcAssets + '/js/*.js'
    },
    scripts: {
        babel: {
            src: srcAssets + '/js/**/*.{es6.js}',
            dest: developmentAssets + '/js',
            options: {
                presets: ['es2015']
            }
        }
    },
    scsslint: {
        src: [
            srcAssets + '/css/**/*.{sass,scss}'
        ],
        options: {
        }
    },
    sass: {
        src: srcAssets + '/css/**/*.{scss,sass}',
        dest: developmentAssets + '/css',
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
        sass:    srcAssets + '/css/**/*.{sass,scss}',
        scripts: srcAssets + '/js/**/*.js',
        images:  srcAssets + '/images/**/*'
    }
};

export default config;
