import React, { Component } from 'react';

import { View, PanResponder, Animated } from 'react-native';

import PropTypes from 'prop-types';

export default class Slider extends Component {
  constructor(props) {
    super(props);
    this.canReachEnd = true;
    this.totalWidth = 0;
    this.state = {
      offsetX: new Animated.Value(props.isFromRight ? props.widthAccordingToOrientation:0),
      squareWidth:  0,
    };
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        return true;
      },
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return !this.canReachEnd;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return true;
      },
      onPanResponderGrant: (evt, gestureState) => {
        this.canReachEnd = true;
      },
      onPanResponderMove: (evt, gestureState) => {
        if(!this.props.disableSliding) {
          const margin = this.totalWidth - this.state.squareWidth * 1.025;
          if (this.props.isFromRight)
          {
            if (gestureState.dx < 0 && gestureState.dx >= -margin)
            {
              var newGestureStateDx = margin + gestureState.dx
              this.setState({ offsetX: new Animated.Value(newGestureStateDx)});
            }
            else if (gestureState.dx < -margin)
            {
              console.warn("inside else if of is from right")
              this.onEndReached(false);
              return;   
            }
            
          }
          else {
            if (gestureState.dx > 0 && gestureState.dx <= margin) {
              this.setState({ offsetX: new Animated.Value(gestureState.dx)});
            } else if (gestureState.dx > margin) {
              this.onEndReached(true);
              return;
            } 
          }

          
        }
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
         this.resetBar();
        this.canReachEnd = true;
      },
      onShouldBlockNativeResponder: (evt, gestureState) => true,
    });
  }

  onEndReached = (isMerged) => {
    console.warn("in lib", isMerged)
    this.canReachEnd && this.props.onEndReached(isMerged);
    this.canReachEnd = false;
     this.resetBar();
  };

  resetBar() {
    Animated.timing(this.state.offsetX, { toValue: this.props.isFromRight?this.props.widthAccordingToOrientation: 0 }).start();
  }

  render() {
    return (
      <View
        onLayout={event => {
          this.totalWidth = event.nativeEvent.layout.width;
        }}
        style={[this.props.containerStyle, { alignItems: 'flex-start' }]}
        //flexDirection:this.props.isFromRight? "row-reverse":"row"
      >
        <Animated.View
          onLayout={event => {
            this.setState({ squareWidth: event.nativeEvent.layout.width });
          }}
          style={{ transform: [{ translateX: this.state.offsetX }] }}
          {...this._panResponder.panHandlers}
        >
          {this.props.sliderElement}
        </Animated.View>

        <View
          style={[
            { position: 'absolute',left:this.props.isFromRight?0:this.props.widthAccordingToOrientation,zIndex: -1 },
            //alignSelf: this.props.isFromRight?"flex-start": 'center',
            //position: 'absolute',
            this.props.childrenContainer,
          ]}
        >
          {this.props.children}
        </View>
      </View>
    );
  }
}

Slider.propTypes = {
  childrenContainer: PropTypes.object,
  containerStyle: PropTypes.object,
  sliderElement: PropTypes.element,
  onEndReached: PropTypes.func,
  disableSliding: PropTypes.bool
};

Slider.defaultProps = {
  childrenContainer: {},
  containerStyle: {},
  sliderElement: <View style={{ width: 50, height: 50, backgroundColor: 'green' }} />,
  onEndReached: () => {},
  disableSliding: false,
  isFromRight: false,
  widthAccordingToOrientation:undefined
};
