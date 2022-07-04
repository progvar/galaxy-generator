import { commonConfiguration } from './webpack.common.js';
import { merge } from 'webpack-merge';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

export default merge(commonConfiguration, {
    mode: 'production',
    plugins: [new CleanWebpackPlugin()],
});
