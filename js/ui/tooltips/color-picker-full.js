import React from 'react'

import { CustomPicker } from 'react-color'
import { Saturation, Hue } from 'react-color/lib/components/common'

class MyColorPicker extends React.Component {

    render() {
        return (
            <div>
                <div style={ styles.saturation }>
                    <Saturation
                        {...this.props}
                    />
                </div>
                <div style={ styles.hue }>
                    <Hue {...this.props} />
                </div>
            </div>
        );
    }
}

const styles = {
    saturation: {
        position: 'relative',
        width: 150,
        height: 150
    },
    hue: {
        height: 10,
        position: 'relative',
        marginBottom: 10,
    }
};

module.exports = CustomPicker(MyColorPicker)