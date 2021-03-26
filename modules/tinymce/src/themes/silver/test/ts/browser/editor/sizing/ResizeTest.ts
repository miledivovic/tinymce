import { Keyboard, Mouse, UiFinder } from '@ephox/agar';
import { before, beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks } from '@ephox/mcagar';
import { Css, Focus, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';
import Theme from 'tinymce/themes/silver/Theme';

import { resizeToPos } from '../../../module/UiUtils';

describe('browser.tinymce.themes.silver.editor.sizing.ResizeTTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    resize: 'both',
    min_height: 300,
    min_width: 300,
    height: 400,
    width: 400,
    max_height: 500,
    max_width: 500
  }, [ Theme ]);

  const assertEditorSize = (container: SugarElement<HTMLElement>, expectedWidth: number, expectedHeight: number) => {
    assert.equal(container.dom.offsetHeight, expectedHeight, `Editor should be ${expectedHeight}px high`);
    assert.equal(container.dom.offsetWidth, expectedWidth, `Editor should be ${expectedWidth}px wide`);
  };

  before(() => {
    const editor = hook.editor();
    // Add a border to ensure we're using the correct height/width (ie border-box sizing)
    editor.dom.setStyles(editor.getContainer(), {
      border: '2px solid #ccc'
    });
  });

  // Make sure the height is reset
  beforeEach(() => {
    const editor = hook.editor();
    const container = SugarElement.fromDom(editor.getContainer());
    Css.setAll(container, {
      width: '400px',
      height: '400px'
    });
  });

  it('Test resize with max/min sizing', () => {
    const editor = hook.editor();
    const container = TinyDom.container(editor);
    const resizeHandle = UiFinder.findIn(SugarBody.body(), '.tox-statusbar__resize-handle').getOrDie();

    // Shrink to 300px
    Mouse.mouseDown(resizeHandle);
    resizeToPos(400, 400, 300, 300);
    assertEditorSize(container, 300, 300);

    // Enlarge to 450px
    Mouse.mouseDown(resizeHandle);
    resizeToPos(300, 300, 450, 450);
    assertEditorSize(container, 450, 450);

    // Try to shrink to below min height
    Mouse.mouseDown(resizeHandle);
    resizeToPos(450, 450, 450, 250);
    assertEditorSize(container, 450, 300);

    // Try to enlarge to above max height
    Mouse.mouseDown(resizeHandle);
    resizeToPos(450, 300, 450, 550);
    assertEditorSize(container, 450, 500);

    // Try to shrink to below min width
    Mouse.mouseDown(resizeHandle);
    resizeToPos(450, 500, 250, 500);
    assertEditorSize(container, 300, 500);

    // Try to enlarge to above max width
    Mouse.mouseDown(resizeHandle);
    resizeToPos(300, 500, 550, 500);
    assertEditorSize(container, 500, 500);
  });

  it('TINY-4823: can be resized via the keyboard', () => {
    const editor = hook.editor();
    const container = TinyDom.container(editor);
    const resizeHandle = UiFinder.findIn(SugarBody.body(), '.tox-statusbar__resize-handle').getOrDie();

    Focus.focus(resizeHandle);

    // Make it larger
    for (let i = 0; i < 20; ++i) {
      Keyboard.keystroke(VK.RIGHT, {}, resizeHandle);
      Keyboard.keystroke(VK.DOWN, {}, resizeHandle);
    }
    assertEditorSize(container, 460, 460);

    for (let i = 0; i < 20; ++i) {
      Keyboard.keystroke(VK.LEFT, {}, resizeHandle);
      Keyboard.keystroke(VK.UP, {}, resizeHandle);
    }
    assertEditorSize(container, 400, 400);
  });
});
