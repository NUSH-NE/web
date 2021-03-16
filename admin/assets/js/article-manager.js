const articleTable = $('articlesTable');

/*
<td class="mdc-data-table__cell mdc-data-table__cell--checkbox">
                            <div class="mdc-checkbox mdc-data-table__row-checkbox">
                                <input type="checkbox" class="mdc-checkbox__native-control" aria-labelledby="u0"/>
                                <div class="mdc-checkbox__background">
                                    <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
                                        <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
                                    </svg>
                                    <div class="mdc-checkbox__mixedmark"></div>
                                </div>
                                <div class="mdc-checkbox__ripple"></div>
                            </div>
                        </td>
                        <th class="mdc-data-table__cell" scope="row" id="u0">Arcus watch slowdown</th>
 */

const addRow = (title, id) => {
    const tr = document.createElement('tr');

    tr.setAttribute('data-row-id', id);
    tr.classList.add('mdc-data-table__row');

    tr.innerHTML = `<td class="mdc-data-table__cell mdc-data-table__cell--checkbox">
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
                        <th class="mdc-data-table__cell" scope="row" id="${id}">${title}</th>`;

    // Append table row
    articleTable.querySelector('tbody').appendChild(tr);

    // Re-layout table
    articleTable.MDCDataTable.layout();
}