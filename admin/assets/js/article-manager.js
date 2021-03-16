const articleTable = $('articlesTable');
const db = firebase.firestore();

// Elements
const delBtn = $('delete-article');
const editBtn = $('edit-article');

const addRow = (data, id) => {
    // Parse data
    const likeRatio = (data.likes / (data.likes + data.dislikes) * 100).toFixed(1);

    const tr = document.createElement('tr');

    tr.setAttribute('data-row-id', id);
    tr.classList.add('mdc-data-table__row');

    tr.innerHTML = `
    <td class="mdc-data-table__cell mdc-data-table__cell--checkbox">
        <div class="mdc-checkbox mdc-data-table__row-checkbox">
            <input type="checkbox" class="mdc-checkbox__native-control" aria-labelledby="${id}"/>
            <div class="mdc-checkbox__background">
                <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
                    <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
                </svg>
                <div class="mdc-checkbox__mixedmark"></div>
            </div>
            <div class="mdc-checkbox__ripple"></div>
        </div>
    </td>
    <th class="mdc-data-table__cell" scope="row" id="${id}">${data.title}</th>
    <th class="mdc-data-table__cell" scope="row" id="${id}">${id}</th>
    <th class="mdc-data-table__cell" scope="row" id="${id}">${data.likes}:${data.dislikes} (${likeRatio}%)</th>`;

    // Append table row
    articleTable.querySelector('tbody').appendChild(tr);

    // Re-layout table
    articleTable.MDCDataTable.layout();
}

// Show loader
articleTable.MDCDataTable.showProgress();

// Listen to check changes
articleTable.MDCDataTable.listen('MDCDataTable:rowSelectionChanged', () => updateBtnState());
articleTable.MDCDataTable.listen('MDCDataTable:selectedAll', () => updateBtnState());
articleTable.MDCDataTable.listen('MDCDataTable:unselectedAll', () => updateBtnState());

const updateBtnState = () => {
    const selArray = articleTable.MDCDataTable.getSelectedRowIds();
    delBtn.disabled = selArray.length === 0;
    editBtn.disabled = selArray.length !== 1;
}

delBtn.onclick = () => {
    $('del-dialog').MDCDialog.open();
}

$('del-dialog').MDCDialog.listen('MDCDialog:closed', (e) => {
    if (e.detail.action === 'delete') {
        const selArray = articleTable.MDCDataTable.getSelectedRowIds();

        selArray.forEach((artID) => {
            db.collection('articles').doc(artID).delete().then(() => {
                showMsg('Deleted article with ID ' + artID);
            }).catch((error) => {
                console.error("Error deleting article: ", error);
            });
        });
    }
})


// Listen to changes
db.collection('articles')
    .onSnapshot((snap) => {
        // Hide loader
        articleTable.MDCDataTable.hideProgress();

        snap.docChanges().forEach((change) => {
            if (change.type === 'added') {
                addRow({
                    title: change.doc.data().title,
                    likes: 10,
                    dislikes: 2
                }, change.doc.id);
            } else if (change.type === 'modified') {
            } else if (change.type === 'removed') {
                q(`[data-row-id="${change.doc.id}"]`).remove();
                articleTable.MDCDataTable.layout();
            }
        });
    });

// Init
updateBtnState();