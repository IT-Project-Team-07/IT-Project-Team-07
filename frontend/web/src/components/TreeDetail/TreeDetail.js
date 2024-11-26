import React from 'react';
import "./TreeDetail.css";

const TreeDetail = ({ selectedTree, onClose }) => {
    return (
        <div className="container">
            <div className="card">
                <div className="content">
                    <button onClick={onClose} className="close-button">
                        <img style={{width:"30px", height:"30px"}} src="close.png" alt="Close" />
                    </button>
                    <img
                        src="tree-icon.png"
                        alt="tree"
                        className="tree-image"
                    />
                    {selectedTree ? (
                        <div className="tree-info">
                            <div className="tree-title">
                                <h2>Boom #{selectedTree.id}</h2>
                            </div>
                            <div className="details">
                                <h3>Data:</h3>
                                <p><strong>Description:</strong> {selectedTree.description}</p>
                                <p><strong>Height:</strong> {selectedTree.height} meter</p>
                                <p><strong>Coordinates:</strong> {selectedTree.latitude}, {selectedTree.longitude}</p>
                            </div>
                        </div>
                    ) : (
                        <p>Select a tree to see details.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TreeDetail;