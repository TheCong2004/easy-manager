"use client";

import { useCallback } from "react";
import { LandingEditorAction } from "../core/editor-export-html";
import { editorReducer, findBlockRecursive } from "../core/editor-reducer";
import { instantiateTemplateBlocks } from "../template-library";
import {
  BlockType,
  EditorData,
  canNodeHaveChildren,
  createDefaultBlock,
  ensureOnlookBlockMeta,
} from "../types";

interface UseEditorBlockActionsOptions {
  data: EditorData;
  handleSelectBlock: (id: string | null) => void;
  push: (data: EditorData) => void;
  recordAction: (action: LandingEditorAction) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  showToast: (message: string, type?: "success" | "info") => void;
}

export function useEditorBlockActions({
  data,
  handleSelectBlock,
  push,
  recordAction,
  selectedId,
  setSelectedId,
  showToast,
}: UseEditorBlockActionsOptions) {
  const handleDropFromPalette = useCallback((blockType: BlockType, insertIndex?: number) => {
    const newBlock = ensureOnlookBlockMeta(createDefaultBlock(blockType));
    const nextIndex = insertIndex ?? data.blocks.length;
    push(editorReducer(data, { type: "INSERT_BLOCK", block: newBlock, index: nextIndex }));
    recordAction({ type: "insert-element", blockId: newBlock.id, blockType, index: nextIndex, timestamp: Date.now() });
    handleSelectBlock(newBlock.id);
    showToast(`ÄÃ£ thÃªm ${newBlock.label}`);
  }, [data, handleSelectBlock, push, recordAction, showToast]);

  const handleDropInside = useCallback((containerId: string, blockType: BlockType, columnIndex?: number) => {
    const newBlock = ensureOnlookBlockMeta(createDefaultBlock(blockType));
    push(editorReducer(data, {
      type: "INSERT_BLOCK_IN_CONTAINER",
      container: { blockId: containerId, columnIndex },
      block: newBlock,
    }));
    recordAction({ type: "insert-element", blockId: newBlock.id, blockType, index: 0, timestamp: Date.now() });
    handleSelectBlock(newBlock.id);
    showToast(`Đã thêm ${newBlock.label || newBlock.type}`);
  }, [data, handleSelectBlock, push, recordAction, showToast]);

  const handleDropItem = useCallback((
    item: { id?: string; type?: BlockType; isPalette?: boolean },
    containerId?: string,
    columnIndex?: number,
    index?: number
  ) => {
    if (item.isPalette && item.type) {
      const blockType = item.type;
      const newBlock = ensureOnlookBlockMeta(createDefaultBlock(blockType));

      if (containerId) {
        push(editorReducer(data, {
          type: "INSERT_BLOCK_IN_CONTAINER",
          container: { blockId: containerId, columnIndex },
          block: newBlock,
          index,
        }));
        recordAction({ type: "insert-element", blockId: newBlock.id, blockType, index: index ?? 0, timestamp: Date.now() });
        handleSelectBlock(newBlock.id);
        showToast(`Đã thêm ${newBlock.label || newBlock.type}`);
      } else {
        push(editorReducer(data, {
          type: "INSERT_BLOCK",
          block: newBlock,
          index,
        }));
        recordAction({ type: "insert-element", blockId: newBlock.id, blockType, index: index ?? data.blocks.length, timestamp: Date.now() });
        handleSelectBlock(newBlock.id);
        showToast(`Đã thêm ${newBlock.label || newBlock.type}`);
      }
    } else if (item.id) {
      push(editorReducer(data, {
        type: "MOVE_BLOCK_TO_PATH",
        blockId: item.id,
        containerId,
        columnIndex,
        index: index ?? 0,
      }));
      recordAction({ type: "move-element", blockId: item.id, fromIndex: -1, toIndex: index ?? 0, timestamp: Date.now() });
    }
  }, [data, handleSelectBlock, push, recordAction, showToast]);

  const handleMoveWithinParent = useCallback((
    parentId: string | undefined,
    columnIndex: number | undefined,
    fromIndex: number,
    toIndex: number
  ) => {
    push(editorReducer(data, {
      type: "MOVE_BLOCK_WITHIN_PARENT",
      parentId,
      columnIndex,
      fromIndex,
      toIndex,
    }));
  }, [data, push]);

  const handleAddBlock = useCallback((blockType: BlockType, customProps?: Record<string, unknown>) => {
    const defaultBlock = createDefaultBlock(blockType);
    const newBlock = ensureOnlookBlockMeta({
      ...defaultBlock,
      props: {
        ...defaultBlock.props,
        ...customProps,
      },
    });
    const selectedBlock = selectedId ? findBlockRecursive(data.blocks, selectedId) : null;
    const canInsertInside = selectedBlock && canNodeHaveChildren(selectedBlock);
    push(editorReducer(data, canInsertInside
      ? { type: "INSERT_BLOCK_IN_CONTAINER", container: { blockId: selectedBlock.id }, block: newBlock }
      : { type: "INSERT_BLOCK", block: newBlock, index: data.blocks.length }
    ));
    recordAction({ type: "insert-element", blockId: newBlock.id, blockType, index: data.blocks.length, timestamp: Date.now() });
    handleSelectBlock(newBlock.id);
    showToast(`ÄÃ£ thÃªm ${newBlock.label}`);
  }, [data, handleSelectBlock, push, recordAction, selectedId, showToast]);

  const handleMoveBlock = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const moved = data.blocks[fromIndex];
    if (!moved) return;
    push(editorReducer(data, { type: "MOVE_BLOCK", fromIndex, toIndex }));
    recordAction({ type: "move-element", blockId: moved.id, fromIndex, toIndex, timestamp: Date.now() });
  }, [data, push, recordAction]);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    handleMoveBlock(index, index - 1);
  }, [handleMoveBlock]);

  const handleMoveDown = useCallback((index: number) => {
    if (index === data.blocks.length - 1) return;
    handleMoveBlock(index, index + 1);
  }, [data.blocks.length, handleMoveBlock]);

  const handleDeleteBlock = useCallback((id: string) => {
    const removed = findBlockRecursive(data.blocks, id);
    push(editorReducer(data, { type: "DELETE_BLOCK", blockId: id }));
    if (removed) {
      recordAction({ type: "remove-element", blockId: removed.id, blockType: removed.type, timestamp: Date.now() });
    }
    if (selectedId === id) handleSelectBlock(null);
    showToast("ÄÃ£ xÃ³a khá»‘i", "info");
  }, [data, handleSelectBlock, push, recordAction, selectedId, showToast]);

  const handleDuplicateBlock = useCallback((id: string) => {
    const index = data.blocks.findIndex((block) => block.id === id);
    const original = findBlockRecursive(data.blocks, id);
    if (!original) return;
    const newBlockId = `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    push(editorReducer(data, { type: "DUPLICATE_BLOCK", blockId: id, newBlockId }));
    recordAction({ type: "insert-element", blockId: newBlockId, blockType: original.type, index: Math.max(0, index + 1), timestamp: Date.now() });
    handleSelectBlock(newBlockId);
    showToast(`ÄÃ£ nhÃ¢n Ä‘Ã´i ${original.label}`);
  }, [data, handleSelectBlock, push, recordAction, showToast]);

  const handleUpdateBlock = useCallback((id: string, newProps: Record<string, unknown>) => {
    const current = findBlockRecursive(data.blocks, id);
    push(editorReducer(data, { type: "UPDATE_BLOCK_PROPS", blockId: id, props: newProps }));
    if (current) {
      const oldProps = current.props as Record<string, unknown>;
      const keys = Object.keys(newProps).filter((key) => oldProps[key] !== newProps[key]);
      recordAction({ type: "update-props", blockId: id, blockType: current.type, keys, timestamp: Date.now() });
    }
  }, [data, push, recordAction]);

  const handleUpdatePageSettings = useCallback((key: string, value: string | number | boolean) => {
    push(editorReducer(data, { type: "UPDATE_PAGE_SETTINGS", key, value }));
    recordAction({ type: "update-page-settings", key, timestamp: Date.now() });
  }, [data, push, recordAction]);

  const handleClearCanvas = useCallback(() => {
    if (!confirm("Báº¡n cÃ³ muá»‘n xÃ³a táº¥t cáº£ cÃ¡c block trÃªn trang nÃ y?")) return;
    push(editorReducer(data, { type: "CLEAR_CANVAS" }));
    setSelectedId(null);
    recordAction({ type: "update-page-settings", key: "clear-canvas", timestamp: Date.now() });
    showToast("ÄÃ£ dá»n sáº¡ch canvas", "info");
  }, [data, push, recordAction, setSelectedId, showToast]);

  const handleApplyTemplate = useCallback((templateId: string, mode: "append" | "replace" = "append") => {
    const templateBlocks = instantiateTemplateBlocks(templateId);
    if (templateBlocks.length === 0) return;
    if (mode === "replace" && data.blocks.length > 0 && !confirm("Thay toÃ n bá»™ canvas báº±ng máº«u nÃ y?")) return;

    push(editorReducer(data, { type: "APPLY_TEMPLATE", blocks: templateBlocks, mode }));
    templateBlocks.forEach((block, offset) => {
      recordAction({
        type: "insert-element",
        blockId: block.id,
        blockType: block.type,
        index: mode === "replace" ? offset : data.blocks.length + offset,
        timestamp: Date.now(),
      });
    });
    handleSelectBlock(templateBlocks[0].id);
    showToast(mode === "replace" ? "ÄÃ£ Ã¡p dá»¥ng máº«u trang má»›i" : "ÄÃ£ chÃ¨n máº«u thiáº¿t káº¿", "success");
  }, [data, handleSelectBlock, push, recordAction, showToast]);

  const handleUseAsset = useCallback((url: string, name: string) => {
    if (selectedId) {
      const current = findBlockRecursive(data.blocks, selectedId);
      if (current?.type === "image") {
        handleUpdateBlock(current.id, { ...current.props, src: url, alt: name });
        showToast(`ÄÃ£ gÃ¡n áº£nh ${name}`, "success");
        return;
      }
      if (current?.type === "hero") {
        handleUpdateBlock(current.id, { ...current.props, bgImage: url });
        showToast(`ÄÃ£ gÃ¡n áº£nh ná»n ${name}`, "success");
        return;
      }
      if (current?.type === "testimonial") {
        handleUpdateBlock(current.id, { ...current.props, authorAvatar: url });
        showToast(`ÄÃ£ gÃ¡n avatar ${name}`, "success");
        return;
      }
    }

    navigator.clipboard?.writeText(url);
    showToast(`ÄÃ£ copy link áº£nh: ${name}`, "info");
  }, [data.blocks, handleUpdateBlock, selectedId, showToast]);

  return {
    handleAddBlock,
    handleApplyTemplate,
    handleClearCanvas,
    handleDeleteBlock,
    handleDropInside,
    handleDropFromPalette,
    handleDropItem,
    handleMoveWithinParent,
    handleDuplicateBlock,
    handleMoveBlock,
    handleMoveDown,
    handleMoveUp,
    handleUpdateBlock,
    handleUpdatePageSettings,
    handleUseAsset,
  };
}
